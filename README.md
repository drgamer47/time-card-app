# Walmart Hours Tracker

A mobile-first web application for tracking work hours and calculating income with overtime support.

## Features

- 📱 Mobile-first responsive design
- ⏰ Track work shifts with clock in/out times
- 🍽️ Optional lunch break tracking (unpaid)
- 💰 Automatic pay calculation with overtime (1.5x after 40 hours/week)
- 📅 Week view (Sunday-Saturday)
- 💵 Pay period view (biweekly, Saturday-Friday)
- 📊 Real-time calculations and summaries
- ✏️ Edit and delete shifts

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Supabase** for backend/auth/database
- **React Router** for navigation
- **date-fns** for date manipulation
- **lucide-react** for icons

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Copy your project URL and anon key

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Database Schema

The app uses a single `shifts` table with the following structure:
- User ID (references auth.users)
- Date
- Scheduled times (optional, for future schedule entry)
- Actual clock in/out times
- Lunch break times (optional)
- Notes

See `supabase/schema.sql` for the complete schema with RLS policies.

## Pay Calculation

- **Hourly Rate:** $14/hour
- **Overtime Rate:** $21/hour (1.5x)
- **Overtime Threshold:** 40 hours per week (Sunday-Saturday)
- **Lunch Breaks:** Unpaid (deducted from total hours)
- **Regular Breaks:** Paid but not tracked

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── BottomNav.tsx
│   ├── PaySummary.tsx
│   ├── ShiftCard.tsx
│   └── ShiftForm.tsx
├── views/           # Page components
│   ├── TodayView.tsx
│   ├── WeekView.tsx
│   ├── PayPeriodView.tsx
│   ├── AddShiftView.tsx
│   └── HistoryView.tsx
├── lib/             # Utilities
│   ├── supabase.ts
│   └── calculations.ts
└── types/           # TypeScript types
    ├── index.ts
    └── database.ts
```

## Development

- The app is currently set up for manual shift entry
- Authentication can be added later using Supabase Auth
- For now, you'll need to be signed in to Supabase to use the app

## License

MIT
