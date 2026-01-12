# Troubleshooting Guide

## Issue: Preview Deployment Works, Production Doesn't

### Common Causes

1. **Environment Variables Not Set for Production**
   - Most common issue!
   - Preview deployments use "Preview" environment variables
   - Production uses "Production" environment variables
   - They need to be set separately

2. **Production Deployment Failed**
   - Check deployment logs in Vercel

3. **Caching Issues**
   - Browser cache
   - Vercel CDN cache

## Quick Fix

### Step 1: Check Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. For each variable (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`):
   - Check that **Production** is checked ✅
   - Not just Preview and Development

### Step 2: Redeploy Production

1. Go to **Deployments** tab
2. Find the production deployment (usually the one with the custom domain)
3. Click **"..."** menu → **"Redeploy"**
4. Make sure to select **"Use existing Build Cache"** = OFF (to rebuild with new env vars)
5. Wait for deployment to complete

### Step 3: Verify

1. Visit your production domain: `https://time-card-app-zeta.vercel.app`
2. Open browser console (F12)
3. Check for errors
4. Should see no Supabase errors

## If Still Not Working

### Check Deployment Logs

1. Go to **Deployments** tab
2. Click on the production deployment
3. Check **"Build Logs"** for errors
4. Look for:
   - Build failures
   - Missing environment variables
   - TypeScript errors

### Clear Cache

1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or open in incognito/private window
3. Clear Vercel cache (if you have access)

### Check Domain Configuration

1. Go to **Settings** → **Domains**
2. Verify `time-card-app-zeta.vercel.app` is configured
3. Check if it's pointing to the correct deployment

## Environment Variable Checklist

Make sure BOTH variables have ALL environments checked:

```
VITE_SUPABASE_URL
✅ Production
✅ Preview
✅ Development

VITE_SUPABASE_ANON_KEY
✅ Production
✅ Preview
✅ Development
```

## Common Mistakes

- ❌ Only checked "Preview" - production won't work
- ❌ Only checked "Production" - preview deployments won't work
- ❌ Forgot to redeploy after adding variables
- ❌ Used wrong key (secret instead of publishable)

## Still Having Issues?

1. Check Vercel deployment logs
2. Compare preview vs production build logs
3. Verify environment variables are identical in both
4. Try creating a new production deployment

