# Deployment Guide

This guide covers deploying the LAB Color Matching Calculator to various platforms.

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Git installed locally

### Step 1: Prepare Repository
1. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LAB Color Calculator"
   ```

2. Create GitHub repository and push:
   ```bash
   git remote add origin https://github.com/your-username/lab-color-calculator.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel
1. Visit [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: (leave empty)

5. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Environment Variables
No environment variables are required for this static application.

## 🌐 Alternative Deployment Options

### Netlify
1. Connect GitHub repository to Netlify
2. Build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: ./
3. Deploy

### GitHub Pages
1. Go to repository Settings > Pages
2. Select source: Deploy from a branch
3. Choose branch: main
4. Folder: / (root)
5. Save

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Firebase: `firebase init hosting`
3. Configure:
   - Public directory: ./
   - Single-page app: No
   - Automatic builds: No
4. Deploy: `firebase deploy`

### AWS S3 + CloudFront
1. Create S3 bucket with static website hosting
2. Upload all files to bucket
3. Configure CloudFront distribution
4. Set up custom domain with Route 53

## 🔧 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors in production
- [ ] All file paths updated for new structure
- [ ] Service worker caching correct files
- [ ] Manifest.json has correct paths

### Performance
- [ ] Images optimized
- [ ] CSS and JS minified (if applicable)
- [ ] Gzip compression enabled
- [ ] Cache headers configured

### PWA Requirements
- [ ] Service worker registered
- [ ] Manifest.json valid
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Icons in correct sizes
- [ ] Offline functionality tested

### SEO & Accessibility
- [ ] Meta tags complete
- [ ] Alt text for images
- [ ] Proper heading structure
- [ ] Color contrast validated
- [ ] Keyboard navigation working

## 🧪 Testing Deployment

### Local Testing
```bash
# Install serve globally
npm install -g serve

# Serve the application
serve . -p 3000

# Test in browser
open http://localhost:3000
```

### Production Testing
1. Test all core functionality
2. Verify PWA installation
3. Test offline functionality
4. Check responsive design
5. Validate export features
6. Test keyboard shortcuts

### Performance Testing
- Use Lighthouse for performance audit
- Test on various devices and browsers
- Verify loading times
- Check PWA score

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 Troubleshooting

### Common Issues

**Service Worker Not Updating**
- Clear browser cache
- Check service worker registration
- Verify file paths in sw.js

**PWA Not Installing**
- Ensure HTTPS is enabled
- Check manifest.json validity
- Verify service worker is active

**Files Not Loading**
- Check file paths in index.html
- Verify directory structure
- Check server configuration

**Export Not Working**
- Test in different browsers
- Check popup blockers
- Verify file permissions

### Debug Tools
- Chrome DevTools > Application tab
- Lighthouse audit
- PWA Builder validation
- Web.dev measure tool

## 📊 Monitoring

### Analytics (Optional)
Add Google Analytics or similar:

```html
<!-- Add to index.html head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Monitoring
Consider adding error tracking:
- Sentry
- LogRocket
- Bugsnag

## 🔒 Security

### Content Security Policy
Add to index.html head:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
```

### HTTPS
- Automatic on Vercel, Netlify
- Required for PWA features
- Use Let's Encrypt for custom servers

## 📈 Post-Deployment

### Performance Monitoring
- Set up uptime monitoring
- Monitor Core Web Vitals
- Track user engagement
- Monitor error rates

### Updates
- Test updates in staging environment
- Use feature flags for gradual rollouts
- Monitor deployment metrics
- Have rollback plan ready

---

**Ready to deploy? Follow the Vercel deployment steps above for the fastest setup!**