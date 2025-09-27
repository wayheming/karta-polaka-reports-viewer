# 📋 Karta Polaka Reports Viewer

Interactive web application for analyzing Karta Polaka (Polish Card) interview reports collected from Telegram channels.

## 🌐 Live Demo

**[View Live Site →](https://username.github.io/karta-polaka-reports-viewer)**

## ✨ Features

- **🔍 Smart Discovery** - Automatically finds and loads all report files
- **❓ Question Focus** - Highlights interview questions prominently  
- **🏛️ Consulate Filtering** - Filter by different Polish consulates
- **📅 Date Range** - Filter reports by interview dates
- **🔎 Text Search** - Search within report content
- **📱 Mobile Responsive** - Works on all devices
- **🎯 Detailed Analysis** - Full OpenAI-powered report breakdown

## 🚀 Quick Start

1. **View Online**: Visit the live demo link above
2. **Local Development**: 
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000
   ```

## 📊 Data Source

Reports are collected and processed from Telegram channels where people share their experiences with Karta Polaka interviews at Polish consulates. Each report includes:

- Interview questions asked
- Required documents
- Consulate location and date
- Tips and recommendations
- Process details

## 🎯 Use Cases

- **📚 Interview Preparation** - Learn what questions are commonly asked
- **📄 Document Planning** - See what documents others brought
- **🏛️ Consulate Comparison** - Compare experiences across different locations
- **📈 Trend Analysis** - Track changes in interview patterns over time

## 🔧 Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks)
- **Data Format**: JSON files with structured OpenAI analysis
- **Deployment**: GitHub Pages with automatic file discovery
- **Mobile Support**: Responsive design for all screen sizes

## 📁 File Structure

```
├── index.html              # Main application
├── script.js               # JavaScript functionality
├── styles.css              # Styling
├── files-manifest.json     # Auto-generated file list
└── *.json                  # Report data files
```

## 🤝 Contributing

### Adding New Reports
1. Add new `karta_polaka_processed_*.json` files to the repository
2. Files are automatically discovered and loaded
3. No code changes needed!

### File Naming Convention
```
karta_polaka_processed_YYYY-MM-DD_HH-MM-SS.json
```

## 📱 Screenshots

### Main Interface
- Clean, modern design with statistics overview
- Advanced filtering options
- Question-focused display

### Report Details  
- Full interview analysis
- Document requirements
- Tips and recommendations
- Original message text

## 🌍 Supported Languages

- **Interface**: English
- **Report Content**: Russian, Ukrainian (original Telegram messages)
- **Analysis**: English (OpenAI processed)

## 📄 Data Privacy

- All data is from public Telegram channels
- No personal information is stored
- Reports are anonymized during processing

## 🔗 Related Projects

- Telegram data collection scripts
- OpenAI report processing pipeline
- Polish consulate information resources

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Check existing reports for similar experiences
- Contribute your own interview reports

## 📜 License

This project is open source and available under the MIT License.

---

**Disclaimer**: This tool is for informational purposes only. Always verify requirements with official Polish consulate sources.
