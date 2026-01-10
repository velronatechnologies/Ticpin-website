# GitHub Pages Setup Guide

## ⚠️ Current Error Fix

**Error**: `Get Pages site failed. Please verify that the repository has Pages enabled`

### Solution: Enable GitHub Pages

#### Option A: Using GitHub Actions (Recommended - Automated)

1. **Go to Repository Settings**:
   - Visit: https://github.com/Aravinth7708/ticpin/settings/pages
   - Or: Repository → Settings → Pages (left sidebar)

2. **Configure Pages**:
   - Under "Build and deployment"
   - **Source**: Select **"GitHub Actions"** from dropdown
   - (NOT "Deploy from a branch")
   
3. **Save and Wait**:
   - The workflow will automatically run on next push
   - Check progress: https://github.com/Aravinth7708/ticpin/actions
   - Takes 2-3 minutes

4. **Access Your Site**:
   - URL: https://Aravinth7708.github.io/ticpin/
   - May take 5-10 minutes for first deployment

#### Option B: Manual Deployment (Simple - No Actions needed)

If GitHub Actions doesn't work, use manual deployment:

1. **Build Your Project Locally**:
   ```bash
   npm run build
   ```

2. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy script to package.json**:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable Pages**:
   - Go to Settings → Pages
   - Source: Select **"Deploy from a branch"**
   - Branch: Select **"gh-pages"** and **"/ (root)"**
   - Save

Let me update your package.json for Option B:

---

## 🎯 Visual Guide

### What to Select in GitHub Settings:

```
Build and deployment
├── Source: [GitHub Actions ▼]  ← Select this!
│
└── NOT "Deploy from a branch"
```

### After Enabling:

```
Your site is live at 🚀
https://Aravinth7708.github.io/ticpin/
```

---

## ✅ Verification Steps

After enabling Pages:

1. ✅ Go to Actions tab
2. ✅ Workflow should be running (yellow circle)
3. ✅ Wait for green checkmark (2-3 minutes)
4. ✅ Visit your site: https://Aravinth7708.github.io/ticpin/

---

## 🔄 Alternative: Use Vercel Instead (Easiest!)

If GitHub Pages is complicated, try Vercel:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import `Aravinth7708/ticpin`
5. Click "Deploy"
6. Done in 30 seconds! ✨

No configuration needed - `vercel.json` is already set up!

---

## 🆘 Still Not Working?

### Common Issues:

**Issue 1**: "Pages not found in settings"
- **Fix**: Make sure repo is public, not private

**Issue 2**: Workflow fails with permissions error
- **Fix**: 
  1. Go to Settings → Actions → General
  2. Scroll to "Workflow permissions"
  3. Select "Read and write permissions"
  4. Save

**Issue 3**: 404 on deployed site
- **Fix**: Wait 10 minutes after first deployment
- Clear browser cache
- Verify `base` path in vite.config.ts matches repo name

---

## 📞 Need Help?

The deployment has been pushed. Now:

1. ✅ Enable GitHub Pages (follow steps above)
2. ✅ Workflow will auto-run
3. ✅ Check status in Actions tab
4. ✅ Visit your site in 5 minutes

**Quick Link**: https://github.com/Aravinth7708/ticpin/settings/pages
