# GitHub Pages Deployment Instructions

## Quick Upload Method (Recommended)
1. Create new repository on GitHub
2. Upload all files from this folder via web interface
3. Enable GitHub Pages in Settings → Pages
4. Select "Deploy from a branch" → main → / (root)

## Git Command Line Method
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Karta Polaka Reports Viewer"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Files Structure
- index.html - Main page
- script.js - JavaScript functionality  
- styles.css - Styling
- files-manifest.json - File list for auto-discovery
- *.json - Report data files

## After Deployment
Your site will be available at:
https://USERNAME.github.io/REPOSITORY-NAME

## Adding New Files
Simply upload new JSON files to the repository - they will be automatically discovered and loaded!
