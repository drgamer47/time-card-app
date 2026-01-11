# NFC Clock In/Out Setup Guide

## Overview

The app now supports smart NFC clock in/out! Tap an NFC tag to open the app and see context-aware actions based on your current shift status.

## How It Works

1. **Tap NFC tag** → App opens with Quick Clock modal
2. **App checks status** → Determines if you're clocked in, on lunch, etc.
3. **Shows valid actions** → Only displays actions that make sense for your current state
4. **One tap to complete** → Tap the action button to clock in, start lunch, end lunch, or clock out

## State Logic

- **Clocked Out** → Can only Clock In
- **Clocked In** → Can Start Lunch OR Clock Out
- **On Lunch** → Can only End Lunch
- **Lunch Ended** → Can only Clock Out

This prevents mistakes like clocking in twice or starting lunch when already on lunch.

## Setting Up NFC Tags

### Step 1: Get NFC Tags

Purchase NFC tags (NTAG213 or NTAG215 recommended):
- Amazon, eBay, or electronics stores
- Stickers or cards work great
- Cost: ~$0.50-$2 per tag

### Step 2: Install NFC Tools App

Download "NFC Tools" (free on Google Play Store):
- Search "NFC Tools" by wakdev
- Install and open the app

### Step 3: Write URL to Tag

1. Open NFC Tools app
2. Tap **"Write"** tab
3. Tap **"Add a record"**
4. Select **"URL / URI"**
5. Enter your app URL:
   ```
   https://your-app-domain.com?nfc=clock
   ```
   Or for local development:
   ```
   http://localhost:5173?nfc=clock
   ```
6. Tap **"Write"**
7. Hold your phone near the NFC tag
8. Wait for "Write successful" message

### Step 4: Place Tags

Stick tags in convenient locations:
- **Locker door** - Easy access when arriving/leaving
- **Desk** - Quick access during work
- **Break room wall** - For lunch breaks
- **Time clock area** - Traditional location

## Using the System

### Clock In
1. Tap NFC tag with phone
2. App opens → See "Clocked Out" status
3. Tap **"Clock In"** button
4. Done! ✅

### Start Lunch
1. Tap NFC tag
2. App opens → See "Working" status
3. Tap **"Start Lunch"** button
4. Done! ✅

### End Lunch
1. Tap NFC tag
2. App opens → See "On Lunch" status
3. Tap **"End Lunch"** button
4. Done! ✅

### Clock Out
1. Tap NFC tag
2. App opens → See "Working" or "Lunch Ended" status
3. Tap **"Clock Out"** button
4. Modal closes automatically ✅

## Manual Access

You can also open the Quick Clock modal manually:
1. Go to **Today** view
2. Tap the **"Quick Clock"** button (teal/green button with lightning icon)
3. Same modal opens with all the same functionality

## Troubleshooting

### Tag Not Opening App
- Make sure NFC is enabled on your phone
- Hold phone closer to tag (usually within 1-2cm)
- Try a different NFC tag
- Check that URL was written correctly

### App Opens But Modal Doesn't Show
- Make sure you're logged in
- Check browser console for errors
- Try manual "Quick Clock" button instead

### Wrong Status Shown
- The app checks today's shift
- If you have multiple shifts today, it uses the most recent one
- Make sure previous shift is clocked out before starting new one

### Can't Clock In
- Check that you're logged in
- Make sure you don't already have an active shift today
- Check internet connection

## Tips

1. **Test First**: Write a test tag and verify it opens the app before placing tags permanently
2. **Multiple Tags**: You can use the same URL on multiple tags (one for each location)
3. **Backup Method**: Keep the manual "Quick Clock" button as backup if tag fails
4. **Battery**: NFC uses minimal battery, but keep phone charged
5. **Case**: Some phone cases can interfere with NFC - test with case on/off

## Security Notes

- NFC tags only contain a URL - no sensitive data
- Authentication is still required (you must be logged in)
- All actions are logged in your shift history
- You can only modify your own shifts (RLS policies)

## Next Steps

1. Write your first NFC tag
2. Test it opens the app
3. Place tags in convenient locations
4. Start using for daily clock in/out!

Enjoy your smart clock in/out system! 🎉

