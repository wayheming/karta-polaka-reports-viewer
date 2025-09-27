let allReports = [];
let filteredReports = [];
let consulates = new Set();

// Automatically load all JSON files from the current directory
async function autoLoadFiles() {
    // Detect if we're running on localhost server or file:// protocol
    const isLocalServer = window.location.protocol === 'http:' && window.location.hostname === 'localhost';
    const baseUrl = isLocalServer ? '' : './';
    
    // Files are now in the same directory as the viewer
    const jsonFiles = [
        'karta_polaka_processed_2025-09-26_21-09-10.json',
        'karta_polaka_processed_2025-09-26_21-38-03.json',
        'karta_polaka_processed_2025-09-26_22-12-39.json',
        'karta_polaka_processed_2025-09-27_05-30-38.json',
        'karta_polaka_processed_2025-09-27_08-42-30.json',
        'karta_polaka_processed_2025-09-27_15-44-01.json',
        'karta_polaka_processed_2025-09-27_17-32-03.json'
    ];

    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('loadingSection').innerHTML = '<p>Loading reports...</p>';
    document.getElementById('reportsSection').innerHTML = '';
    
    allReports = [];
    consulates.clear();
    
    let filesProcessed = 0;
    let successfulFiles = 0;
    
    for (const filename of jsonFiles) {
        try {
            const response = await fetch(filename);
            if (response.ok) {
                const data = await response.json();
                processFileData(data, filename);
                successfulFiles++;
                console.log(`Successfully loaded: ${filename}`);
            } else {
                console.warn(`Could not load file: ${filename} (Status: ${response.status})`);
            }
        } catch (error) {
            console.error(`Error loading file ${filename}:`, error);
        }
        
        filesProcessed++;
        
        // Update progress
        document.getElementById('loadingSection').innerHTML = 
            `<p>Loading reports... (${filesProcessed}/${jsonFiles.length} files processed)</p>`;
    }
    
    if (successfulFiles === 0) {
        document.getElementById('loadingSection').innerHTML = 
            '<div class="error">Could not load files automatically. Files may not be available or you need to run a local server.</div>';
        setTimeout(() => {
            document.getElementById('loadingSection').style.display = 'none';
        }, 3000);
    } else {
        finishLoading(successfulFiles);
    }
}

function loadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select at least one JSON file');
        return;
    }

    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('reportsSection').innerHTML = '';
    
    allReports = [];
    consulates.clear();
    
    let filesProcessed = 0;
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                processFileData(data, file.name);
                filesProcessed++;
                
                if (filesProcessed === files.length) {
                    finishLoading(files.length);
                }
            } catch (error) {
                console.error('Error parsing file:', file.name, error);
                filesProcessed++;
                
                if (filesProcessed === files.length) {
                    finishLoading(files.length);
                }
            }
        };
        reader.readAsText(file);
    });
}

function processFileData(data, filename) {
    if (data.processed_messages && Array.isArray(data.processed_messages)) {
        data.processed_messages.forEach(message => {
            if (message.openai_analysis && !message.openai_analysis.skip) {
                const report = {
                    filename: filename,
                    messageId: message.original_message.id,
                    date: message.original_message.date_formatted,
                    originalMessage: message.original_message.message,
                    analysis: message.openai_analysis,
                    hashtags: message.original_message.hashtags_found || []
                };
                
                // Extract questions from analysis
                report.questions = [];
                if (message.openai_analysis.reports && message.openai_analysis.reports.length > 0) {
                    message.openai_analysis.reports.forEach(analysisReport => {
                        if (analysisReport.questions && analysisReport.questions.raw_list) {
                            report.questions = report.questions.concat(analysisReport.questions.raw_list);
                        }
                    });
                }
                
                // Extract consulate from hashtags
                const consulateTag = report.hashtags.find(tag => 
                    tag.includes('белосток') || tag.includes('варшава') || 
                    tag.includes('краков') || tag.includes('гданьск') ||
                    tag.includes('вроцлав') || tag.includes('катовице')
                );
                
                if (consulateTag) {
                    report.consulate = consulateTag.replace('#', '');
                    consulates.add(report.consulate);
                }
                
                allReports.push(report);
            }
        });
    }
}

function finishLoading(filesCount) {
    document.getElementById('loadingSection').style.display = 'none';
    
    // Update stats
    document.getElementById('filesCount').textContent = filesCount;
    document.getElementById('reportsCount').textContent = allReports.length;
    document.getElementById('consulatesCount').textContent = consulates.size;
    
    // Populate consulate filter
    const consulateFilter = document.getElementById('consulateFilter');
    consulateFilter.innerHTML = '<option value="">All Consulates</option>';
    Array.from(consulates).sort().forEach(consulate => {
        const option = document.createElement('option');
        option.value = consulate;
        option.textContent = consulate.charAt(0).toUpperCase() + consulate.slice(1);
        consulateFilter.appendChild(option);
    });
    
    // Show filters and apply initial filter (only reports with questions by default)
    document.getElementById('filtersSection').style.display = 'block';
    filteredReports = allReports.filter(report => report.questions && report.questions.length > 0);
    renderReports();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const consulateFilter = document.getElementById('consulateFilter').value;
    const questionsFilter = document.getElementById('questionsFilter').value;
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;
    
    filteredReports = allReports.filter(report => {
        // Questions filter
        if (questionsFilter === 'with_questions' && (!report.questions || report.questions.length === 0)) {
            return false;
        }
        
        // Search filter
        if (searchTerm && !report.originalMessage.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Consulate filter
        if (consulateFilter && report.consulate !== consulateFilter) {
            return false;
        }
        
        // Date filters
        if (dateFrom || dateTo) {
            const reportDate = new Date(report.date);
            if (dateFrom && reportDate < new Date(dateFrom)) {
                return false;
            }
            if (dateTo && reportDate > new Date(dateTo)) {
                return false;
            }
        }
        
        return true;
    });
    
    renderReports();
}

function renderReports() {
    const reportsSection = document.getElementById('reportsSection');
    
    if (filteredReports.length === 0) {
        reportsSection.innerHTML = '<div class="no-results">No reports found matching your criteria</div>';
        return;
    }
    
    reportsSection.innerHTML = filteredReports.map((report, index) => {
        const excerpt = report.originalMessage.substring(0, 150) + (report.originalMessage.length > 150 ? '...' : '');
        
        return `
            <div class="report-card">
                <div class="report-header">
                    <div class="report-meta">
                        <span class="report-date">📅 ${report.date}</span>
                        ${report.consulate ? `<span class="report-consulate">${report.consulate}</span>` : ''}
                    </div>
                    <div style="font-size: 12px; opacity: 0.8;">
                        Message ID: ${report.messageId} | File: ${report.filename}
                    </div>
                </div>
                <div class="report-body">
                    ${report.questions && report.questions.length > 0 ? `
                        <div class="questions-section" style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <h4 style="color: #2c5530; margin-bottom: 10px; font-size: 16px;">❓ Questions Asked:</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${report.questions.map(question => `
                                    <li style="background: white; padding: 8px 12px; margin: 5px 0; border-radius: 4px; border-left: 3px solid #4CAF50;">
                                        ${question}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="report-excerpt" style="color: #666; font-size: 14px;">${excerpt}</div>
                    
                    ${report.hashtags.length > 0 ? `
                        <div class="report-tags">
                            ${report.hashtags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <button class="expand-btn" onclick="toggleDetails(${index})">
                        Show Full Analysis
                    </button>
                    
                    <div class="report-details" id="details-${index}">
                        ${renderAnalysisDetails(report.analysis, report.originalMessage)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAnalysisDetails(analysis, originalMessage) {
    let html = '';
    
    // Show original message first
    if (originalMessage) {
        html += '<div class="detail-section" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #f8f9fa;">';
        html += '<h4 style="color: #2c3e50; margin-bottom: 15px;">📝 Original Message</h4>';
        html += `<div style="background: white; padding: 15px; border-radius: 6px; line-height: 1.6; white-space: pre-wrap; font-family: inherit;">${originalMessage}</div>`;
        html += '</div>';
    }
    
    // Show all reports from analysis
    if (analysis.reports && analysis.reports.length > 0) {
        analysis.reports.forEach((report, reportIndex) => {
            html += `<div class="detail-section" style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px;">`;
            html += `<h4 style="color: #2c3e50; margin-bottom: 15px;">📋 Report ${reportIndex + 1}</h4>`;
            
            // Interview details
            if (report.interview_city || report.interview_date || report.examiner) {
                html += '<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">🎯 Interview Info</h5><ul>';
                if (report.interview_city) html += `<li><strong>City:</strong> ${report.interview_city}</li>`;
                if (report.interview_date) html += `<li><strong>Date:</strong> ${report.interview_date}</li>`;
                if (report.examiner && report.examiner.name) html += `<li><strong>Examiner:</strong> ${report.examiner.name}</li>`;
                if (report.examiner && report.examiner.label) html += `<li><strong>Examiner Title:</strong> ${report.examiner.label}</li>`;
                if (report.outcome) html += `<li><strong>Outcome:</strong> ${report.outcome}</li>`;
                if (report.duration_minutes) html += `<li><strong>Duration:</strong> ${report.duration_minutes} minutes</li>`;
                html += '</ul></div>';
            }
            
            // Questions (detailed)
            if (report.questions) {
                if (report.questions.raw_list && report.questions.raw_list.length > 0) {
                    html += '<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">❓ Questions (Raw List)</h5><ul>';
                    report.questions.raw_list.forEach(q => {
                        html += `<li style="background: #fff3cd; padding: 8px; margin: 3px 0; border-radius: 4px;">${q}</li>`;
                    });
                    html += '</ul></div>';
                }
                
                if (report.questions.canonical_topics && report.questions.canonical_topics.length > 0) {
                    html += '<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">🏷️ Question Topics</h5><ul>';
                    report.questions.canonical_topics.forEach(topic => {
                        html += `<li style="background: #d1ecf1; padding: 5px 8px; margin: 3px 0; border-radius: 4px;">${topic}</li>`;
                    });
                    html += '</ul></div>';
                }
            }
            
            // Documents
            if (report.documents && report.documents.mentioned && report.documents.mentioned.length > 0) {
                html += '<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">📄 Documents</h5><ul>';
                report.documents.mentioned.forEach(doc => {
                    html += `<li style="background: #f8f9fa; padding: 5px 8px; margin: 3px 0; border-radius: 4px;">${doc}</li>`;
                });
                html += '</ul></div>';
            }
            
            // Candidate info
            if (report.candidate) {
                html += '<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">👤 Candidate Info</h5><ul>';
                if (report.candidate.who) html += `<li><strong>Who:</strong> ${report.candidate.who}</li>`;
                if (report.candidate.gender) html += `<li><strong>Gender:</strong> ${report.candidate.gender}</li>`;
                if (report.candidate.age) html += `<li><strong>Age:</strong> ${report.candidate.age}</li>`;
                if (report.candidate.polish_study) html += `<li><strong>Polish Study:</strong> ${report.candidate.polish_study}</li>`;
                html += '</ul></div>';
            }
            
            // Process notes
            if (report.queue_and_process_notes) {
                html += `<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">⏱️ Process Notes</h5><p style="background: #e9ecef; padding: 10px; border-radius: 4px;">${report.queue_and_process_notes}</p></div>`;
            }
            
            // Next steps
            if (report.next_steps && (report.next_steps.decision_or_pickup_date || report.next_steps.promised_action)) {
                html += '<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">⏭️ Next Steps</h5><ul>';
                if (report.next_steps.decision_or_pickup_date) html += `<li><strong>Decision/Pickup Date:</strong> ${report.next_steps.decision_or_pickup_date}</li>`;
                if (report.next_steps.promised_action) html += `<li><strong>Promised Action:</strong> ${report.next_steps.promised_action}</li>`;
                html += '</ul></div>';
            }
            
            // Tips and notes
            if (report.tips_and_notes) {
                html += `<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">💡 Tips & Notes</h5><p style="background: #d4edda; padding: 10px; border-radius: 4px; line-height: 1.5;">${report.tips_and_notes}</p></div>`;
            }
            
            // Confidence
            if (report.confidence) {
                html += `<div style="margin-bottom: 15px;"><h5 style="color: #34495e; margin-bottom: 8px;">🎯 Analysis Confidence</h5><p style="background: #f8f9fa; padding: 8px; border-radius: 4px;"><strong>${(report.confidence * 100).toFixed(0)}%</strong></p></div>`;
            }
            
            html += '</div>';
        });
    }
    
    // Show segmentation if available
    if (analysis.segmentation && analysis.segmentation.segments) {
        html += '<div class="detail-section" style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px;">';
        html += '<h4 style="color: #2c3e50; margin-bottom: 15px;">📝 Text Segmentation</h4><ul>';
        analysis.segmentation.segments.forEach(segment => {
            html += `<li style="background: #f8f9fa; padding: 8px; margin: 5px 0; border-radius: 4px;"><strong>${segment.label}:</strong> ${segment.text_excerpt || 'N/A'}</li>`;
        });
        html += '</ul></div>';
    }
    
    return html || '<p>No detailed analysis available</p>';
}

function toggleDetails(index) {
    const details = document.getElementById(`details-${index}`);
    const button = details.previousElementSibling;
    
    if (details.classList.contains('expanded')) {
        details.classList.remove('expanded');
        button.textContent = 'Show Analysis Details';
    } else {
        details.classList.add('expanded');
        button.textContent = 'Hide Analysis Details';
    }
}

function clearData() {
    allReports = [];
    filteredReports = [];
    consulates.clear();
    
    document.getElementById('fileInput').value = '';
    document.getElementById('filtersSection').style.display = 'none';
    document.getElementById('reportsSection').innerHTML = '';
    
    // Reset stats
    document.getElementById('filesCount').textContent = '0';
    document.getElementById('reportsCount').textContent = '0';
    document.getElementById('consulatesCount').textContent = '0';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for real-time filtering
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('consulateFilter').addEventListener('change', applyFilters);
    document.getElementById('questionsFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFromFilter').addEventListener('change', applyFilters);
    document.getElementById('dateToFilter').addEventListener('change', applyFilters);
    
    // Auto-load files on page load
    autoLoadFiles();
});
