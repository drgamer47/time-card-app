# Step-by-Step Vercel Deployment

## 🚀 Quick Start (5 Minutes)

### Step 1: Go to Vercel
1. Open your browser
2. Go to: **https://vercel.com**
3. Click **"Sign Up"** or **"Log In"**
4. Choose **"Continue with GitHub"**

### Step 2: Import Your Project
1. After logging in, you'll see the Vercel dashboard
2. Click the **"Add New..."** button (top right)
3. Select **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **`drgamer47/time-card-app`**
6. Click **"Import"** next to it

### Step 3: Configure Project Settings
Vercel should auto-detect everything, but verify:

**Framework Preset:**
- Should show: **Vite** ✅
- If not, select "Vite" from dropdown

**Build and Output Settings:**
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `dist` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

**Environment Variables:**
Click **"Environment Variables"** section and add:

1. **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co` (your Supabase URL)
   - Environments: Check all (Production, Preview, Development)

2. **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `your-anon-key-here` (your Supabase anon key)
   - Environments: Check all (Production, Preview, Development)

**Where to find Supabase keys:**
- Go to your Supabase project dashboard
- Click **Settings** → **API**
- Copy **Project URL** → Use for `VITE_SUPABASE_URL`
- Copy **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`

### Step 4: Deploy!
1. Scroll down and click the big **"Deploy"** button
2. Wait 1-2 minutes for build to complete
3. You'll see build logs in real-time
4. When done, you'll see: **"Congratulations! Your project has been deployed."**

### Step 5: Get Your URL
After deployment, you'll see:
- **Production URL:** `https://time-card-app.vercel.app` (or similar)
- Click the URL to open your app!

## 📱 Update NFC Tags

After deployment, update your NFC tags with your new URL:
```
https://time-card-app.vercel.app?nfc=clock
```

## ✅ Verify Deployment

1. **Open your app URL** in a browser
2. **Test authentication** - Sign up/Login
3. **Test adding a shift**
4. **Test NFC modal** - Visit `?nfc=clock` in URL
5. **Test on mobile** - Open URL on phone, try "Add to Home Screen"

## 🔄 Auto-Deploy Setup

Once connected, every time you:
- **Push to `main` branch** → Auto-deploys to production
- **Push to other branches** → Creates preview deployment
- **Open a Pull Request** → Creates preview deployment

No more manual deployments needed! 🎉

## 🐛 Troubleshooting

### "Build Failed" Error
1. Check the build logs in Vercel dashboard
2. Look for red error messages
3. Common issues:
   - Missing environment variables
   - TypeScript errors (should be fixed now)
   - Missing dependencies

### "404 Not Found" on Routes
- Check that `vercel.json` exists in your project root
- Verify it has the rewrite rule: `"source": "/(.*)", "destination": "/index.html"`

### Environment Variables Not Working
- Make sure you added them in Vercel dashboard
- Redeploy after adding env vars (click "Redeploy" button)
- Check that variable names start with `VITE_` (required for Vite)

### Can't Find Repository
- Make sure you're logged into GitHub in Vercel
- Check that the repository is public or you've given Vercel access
- Try refreshing the import page

## 📸 What You Should See

**Vercel Dashboard:**
```
┌─────────────────────────────────┐
│  Your Projects                  │
│  ┌───────────────────────────┐  │
│  │ time-card-app             │  │
│  │ ✅ Production             │  │
│  │ https://time-card-app...  │  │
│  │ Last deployed: 2 min ago │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Deployment Status:**
- ✅ Green checkmark = Success
- ⏳ Spinning = Building
- ❌ Red X = Failed (check logs)

## 🎯 Next Steps

1. ✅ Deploy to Vercel (you're here!)
2. 📱 Test on mobile device
3. 🏷️ Update NFC tags with production URL
4. 📊 Monitor usage in Vercel dashboard
5. 🔔 Set up deployment notifications (optional)

## 💡 Pro Tips

- **Preview Deployments:** Every branch gets its own URL for testing
- **Rollback:** If something breaks, you can rollback to previous deployment
- **Analytics:** Vercel provides built-in analytics (may require upgrade)
- **Custom Domain:** Add your own domain in Settings → Domains

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Check build logs for specific errors
- Make sure all environment variables are set

Happy Deploying! 🚀



