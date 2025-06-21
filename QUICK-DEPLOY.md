# 🚀 Quick Deployment Guide

## Method 1: GitHub Web Interface (Recommended)

1. **Create Repository**:
   - Go to github.com
   - Click "+" → "New repository"
   - Name: `portfolio` (or any name)
   - Make it Public
   - Don't initialize with README
   - Click "Create repository"

2. **Upload Files**:
   - Click "uploading an existing file"
   - Drag all files from your portfolio folder
   - Commit message: "Add portfolio website"
   - Click "Commit changes"

3. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, Folder: / (root)
   - Save

4. **Your site will be live at**: `https://yourusername.github.io/repository-name`

## Method 2: Git Commands

```bash
# In your portfolio folder, run these commands:

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Add portfolio website"

# Add your GitHub repository (replace with your URL)
git remote add origin https://github.com/yourusername/portfolio.git

# Push to GitHub
git push -u origin main
```

## After Deployment

1. Wait 5-10 minutes for the site to go live
2. Visit your URL to see your portfolio
3. Share the link with others!

## Custom Domain (Optional)

If you want a custom domain like `yourname.com`:
1. Buy a domain from any registrar
2. Add a CNAME file to your repository with your domain
3. Configure DNS settings at your registrar
4. Update GitHub Pages settings

## Need Help?

- Check the full DEPLOYMENT.md file for more options
- GitHub Pages documentation: https://pages.github.com/
