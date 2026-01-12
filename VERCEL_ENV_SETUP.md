key: # Setting Environment Variables in Vercel

## Quick Fix for "Supabase URL and Anon Key must be set" Error

Your app needs Supabase credentials to work. Here's how to add them in Vercel:

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in
3. Find your project: **time-card-app** (or whatever you named it)
4. Click on the project name

### 2. Navigate to Settings
1. Click **"Settings"** tab (top navigation)
2. Click **"Environment Variables"** in the left sidebar

### 3. Add Environment Variables

Click **"Add New"** and add these two variables:

#### Variable 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Your Supabase project URL
  - Format: `https://xxxxxxxxxxxxx.supabase.co`
  - Find it in: Supabase Dashboard → Settings → API → Project URL
- **Environments:** Check all three:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

#### Variable 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase **publishable key**
  - Format: Starts with `sb_publishable_...`
  - Find it in: Supabase Dashboard → Settings → API → **Publishable key** section
  - Click the copy icon to copy the full key
- **Environments:** Check all three:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### 4. Save and Redeploy

1. Click **"Save"** after adding each variable
2. Go to **"Deployments"** tab
3. Find your latest deployment
4. Click the **"..."** menu (three dots)
5. Click **"Redeploy"**
6. Wait for deployment to complete

## Where to Find Your Supabase Keys

### Option 1: Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project
3. Click **Settings** (gear icon in left sidebar)
4. Click **API** in the settings menu
5. You'll see:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **Publishable key** section → Use the `sb_publishable_...` key for `VITE_SUPABASE_ANON_KEY`
   - Note: Supabase now uses "Publishable keys" instead of the old "anon public" keys

### Option 2: Your Local .env File
If you have a `.env` file locally, copy the values from there:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NaUw1mnN2pkLErH5laTh1w_tyItNpin
```
Note: The key format is now `sb_publishable_...` (not the old `eyJ...` JWT format)

## Verify It's Working

After redeploying:
1. Visit your Vercel URL
2. Open browser console (F12)
3. You should **NOT** see: "Supabase URL and Anon Key must be set"
4. The app should load and show the login page

## Troubleshooting

### Still Seeing the Error?
1. **Double-check variable names:**
   - Must be exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Case-sensitive!
   - No extra spaces

2. **Check environments:**
   - Make sure you checked Production, Preview, AND Development
   - If you only checked Production, preview deployments won't work

3. **Redeploy after adding:**
   - Environment variables only apply to NEW deployments
   - You must redeploy after adding them

4. **Check the values:**
   - URL should start with `https://` and end with `.supabase.co`
   - Key should start with `sb_publishable_` (new format) or `eyJ` (old format - both work)

### Manifest.json 401 Error
This is usually harmless - the manifest should still work. But if it's causing issues:
1. Check that `public/manifest.json` exists in your repo
2. Verify it's being copied during build
3. The 401 might be a Vercel caching issue - try clearing browser cache

## Security Notes

- ✅ The **publishable key** (`sb_publishable_...`) is safe to expose in frontend code
- ✅ It's designed for client-side use
- ✅ Your RLS (Row Level Security) policies protect your data
- ❌ Never use the **secret key** (`sb_secret_...`) in frontend code - it's for backend only

## Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` in Vercel
- [ ] Added `VITE_SUPABASE_ANON_KEY` in Vercel
- [ ] Checked all three environments (Production, Preview, Development)
- [ ] Redeployed the project
- [ ] Verified app loads without errors

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Supabase Docs: https://supabase.com/docs/guides/api

