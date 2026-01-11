# Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to the SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `supabase/schema.sql` into the SQL editor
5. Run the SQL to create the `shifts` table and set up Row Level Security

### 3. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Settings → API
2. Copy your:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### 4. Configure Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set Up Authentication (Optional for Development)

For development without authentication:

1. The app will use a placeholder user ID stored in localStorage
2. For production, you'll need to set up Supabase Auth:
   - Go to Authentication → Providers in Supabase
   - Enable your preferred auth method (Email, Google, etc.)
   - Update the app to include auth flows

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Troubleshooting

### "Failed to load shift" or Database Errors

- Make sure you've run the SQL schema in Supabase
- Verify your `.env` file has the correct credentials
- Check that Row Level Security policies are set up correctly
- For development, the app uses a placeholder user ID if no auth is set up

### Tailwind Styles Not Working

- Make sure `src/index.css` is imported in `src/main.tsx`
- Verify `tailwind.config.js` has the correct content paths
- Try restarting the dev server

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Check that all TypeScript types are correct
- Verify environment variables are set

## Next Steps

1. **Add Authentication**: Set up Supabase Auth for production use
2. **Test the App**: Add some test shifts to verify calculations
3. **Customize**: Adjust colors, rates, or features as needed

## Development Notes

- The app currently works with a placeholder user ID for development
- In production, proper authentication should be required
- Pay calculations assume $14/hour regular and $21/hour overtime
- Overtime kicks in after 40 hours per week (Sunday-Saturday)
- Pay periods are biweekly (Saturday-Friday)

