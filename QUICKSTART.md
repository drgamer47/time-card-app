# Quick Start Guide

## 🚀 Get Your App Running in 5 Steps

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details (name, database password, region)
4. Wait 2-3 minutes for project to be ready

### Step 2: Set Up Database
1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open `supabase/schema.sql` from this project
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 3: Get Your API Keys
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

### Step 4: Create .env File
1. In the project root, create a file named `.env`
2. Add these two lines (replace with your actual values):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjU2NzIwMCwiZXhwIjoxOTU4MTQzMjAwfQ.example
```

### Step 5: Start the App
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

## ✅ Test It Out

1. Click "Add Today's Shift" on the home page
2. Fill in:
   - Date (defaults to today)
   - Clock In: `09:00`
   - Clock Out: `17:00`
   - Optional: Add lunch break (e.g., 12:00 - 13:00)
3. Click "Save Shift"
4. Navigate to "Week" view to see your shift and pay calculations!

## 🎯 What You Can Do Now

- ✅ Add shifts with clock in/out times
- ✅ Track lunch breaks (unpaid time)
- ✅ View weekly hours and pay
- ✅ See pay period summaries
- ✅ Edit or delete shifts
- ✅ View shift history

## 🔐 Adding Authentication (Later)

For now, the app works with a placeholder user ID. To add real authentication:

1. In Supabase: **Authentication** → **Providers**
2. Enable "Email" provider
3. Add login/signup components to the app
4. Update the app to use real user sessions

## 🐛 Troubleshooting

**"Failed to create shift" error?**
- Check your `.env` file has correct values
- Make sure you ran the SQL schema in Supabase
- Check browser console for specific error messages

**Styles look broken?**
- Make sure you ran `npm install`
- Try restarting the dev server: `npm run dev`

**Database connection issues?**
- Verify your Supabase project is active (not paused)
- Check that RLS policies were created (they're in the schema.sql)

---

**Need help?** Check `SETUP.md` for more detailed instructions.

