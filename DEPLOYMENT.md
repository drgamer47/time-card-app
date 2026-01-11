# Deployment Guide - Vercel

## Quick Deploy

### Option 1: GitHub Auto-Deploy (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Repository**
   - Click "Add New Project"
   - Select `drgamer47/time-card-app`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL: `https://time-card-app.vercel.app`

6. **Auto-Deploy Enabled**
   - Every push to `main` auto-deploys
   - Preview deployments for PRs

### Option 2: CLI Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Confirm settings

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### After Initial Setup

**Git Push (Auto-Deploy)** - If connected to GitHub:
```bash
git push origin main
```
Auto-deploys to production on push to `main`.

## Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Important:** After adding env vars, redeploy for them to take effect.

## Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## NFC Tag URL

After deployment, Vercel gives you a URL like:
```
https://hours-tracker.vercel.app
```

Use this for your NFC tags:
```
https://hours-tracker.vercel.app?nfc=clock
```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Update NFC tag URLs to use custom domain

## Preview Deployments

Every branch/PR gets its own preview URL:
```
https://hours-tracker-git-branch-name.vercel.app
```

Great for testing before merging!

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build` locally first

### Service Worker Not Updating
- Clear browser cache
- Check `vercel.json` has correct headers for `sw.js`
- Verify service worker is in `public/` directory

### Routes Not Working
- Verify `vercel.json` has rewrite rule for `/*` → `/index.html`
- Check React Router is configured correctly

### PWA Not Installing
- Check `manifest.json` is accessible at `/manifest.json`
- Verify icons exist in `public/` directory
- Test in Chrome DevTools → Application → Manifest

## Testing Locally Before Deploy

```bash
# Build
npm run build

# Preview
npm run preview

# Test on mobile device
# Find your computer's IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# Visit: http://YOUR_IP:4173
```

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] NFC tag URL updated with production URL
- [ ] PWA installs correctly on mobile
- [ ] Service worker registers
- [ ] All routes work (test navigation)
- [ ] Authentication works
- [ ] Supabase connection works

## Continuous Deployment

Once connected to GitHub:
1. Push to `main` → Auto-deploys to production
2. Push to other branches → Creates preview deployment
3. Open PR → Creates preview deployment with link

No manual deployment needed! 🎉

