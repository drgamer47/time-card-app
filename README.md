# Hours Tracker - PWA

A mobile-first Progressive Web App for tracking work hours and calculating income with overtime support. Features smart NFC clock in/out and real-time pay calculations.

## Features

- ⏰ **Smart Clock In/Out** - NFC tag support for quick clock actions
- 📊 **Pay Calculations** - Automatic overtime and lunch deduction calculations
- 📱 **PWA** - Install as native app on mobile devices
- 🎯 **Context-Aware Actions** - Only shows valid actions based on shift status
- 📅 **Multiple Views** - Today, Week, and Pay Period views
- 💰 **Real-Time Totals** - See your earnings as you work

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** - Modern, responsive styling
- **Supabase** - Backend, authentication, and database
- **React Router** - Client-side navigation
- **date-fns** - Date manipulation
- **lucide-react** - Icons

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- (Optional) NFC tags for clock in/out

### Installation

1. **Clone the repository**
   ```bash
   https://github.com/drgamer47/time-card-app
   cd time-card-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   - Run the SQL in `supabase/schema.sql` in your Supabase SQL Editor
   - Run `supabase/migration_make_actual_nullable.sql` to enable scheduled shifts

5. **Start development server**
   ```bash
   npm run dev
   ```

## Documentation

- [Quick Start Guide](./QUICKSTART.md) - Get up and running quickly
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Vercel
- [NFC Setup Guide](./NFC_SETUP_GUIDE.md) - Set up NFC clock in/out
- [Auth Setup](./AUTH_SETUP.md) - Configure authentication
- [Database Migration](./DATABASE_MIGRATION.md) - Database setup

## Deployment

### Vercel (Recommended)

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import this repository
   - Set environment variables in Vercel dashboard

2. **Auto-deploy**
   - Every push to `main` auto-deploys
   - Preview deployments for PRs

3. **Get your URL**
   ```
   https://your-app.vercel.app
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## NFC Clock In/Out

Set up NFC tags for one-tap clock in/out:

1. Write NFC tag with URL: `https://your-app.com?nfc=clock`
2. Tap tag → App opens with Quick Clock modal
3. Tap action button → Done!

See [NFC_SETUP_GUIDE.md](./NFC_SETUP_GUIDE.md) for complete setup.

## Project Structure

```
hours-tracker/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── icon-*.png         # PWA icons (create these)
├── src/
│   ├── components/        # React components
│   │   ├── NFCClockModal.tsx
│   │   ├── ShiftForm.tsx
│   │   └── ...
│   ├── views/            # Page views
│   │   ├── TodayView.tsx
│   │   ├── WeekView.tsx
│   │   └── ...
│   ├── lib/              # Utilities
│   │   ├── calculations.ts
│   │   └── supabase.ts
│   └── types/            # TypeScript types
├── supabase/             # Database schemas
├── vercel.json           # Vercel config
└── vite.config.ts        # Vite config
```

## Features in Detail

### Smart Clock In/Out
- Detects current shift status
- Shows only valid actions
- Prevents double clock-in
- Handles lunch breaks

### Pay Calculations
- Regular hours: $14/hour
- Overtime: $21/hour (after 40 hours/week)
- Automatic lunch deduction
- Biweekly pay periods (Saturday-Friday)
- Payday: Thursday after period ends

### Views
- **Today View** - Current shift, pay period summary, upcoming shifts
- **Week View** - Weekly hours and pay breakdown
- **Pay Period View** - Biweekly summary with weekly breakdown

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
npm run deploy
```

## Environment Variables

Required:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ using React, TypeScript, and Supabase
