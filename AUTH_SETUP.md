# Authentication Setup Guide

## Quick Fix for RLS Error

The app now requires authentication to work with Supabase's Row Level Security (RLS). Here's how to set it up:

### Step 1: Enable Email Authentication in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider
4. Make sure it's **Enabled**
5. (Optional) Configure email templates if you want custom verification emails

### Step 2: Create Your Account

1. When you open the app, you'll see a login screen
2. Click "Don't have an account? Sign up"
3. Enter any email address (e.g., `test@example.com`)
4. Enter a password (minimum 6 characters)
5. Click "Sign Up"

### Step 3: Verify Your Email (Optional)

- If email confirmation is enabled, check your email and click the verification link
- If email confirmation is disabled, you can sign in immediately after signing up

### Step 4: Sign In

1. Enter your email and password
2. Click "Sign In"
3. You'll now be able to add shifts!

## Disabling Email Confirmation (For Development)

If you want to skip email verification for faster development:

1. In Supabase dashboard: **Authentication** → **Settings**
2. Under **Email Auth**, find **Enable email confirmations**
3. Toggle it **OFF**
4. Now you can sign in immediately after signing up

## Troubleshooting

### "Invalid login credentials"
- Make sure you've created an account first (use Sign Up)
- Check that your password is at least 6 characters
- Try signing up again with a different email

### "Email not confirmed"
- Check your email for a verification link
- Or disable email confirmation in Supabase settings (see above)

### Still getting RLS errors?
- Make sure you're signed in (check the top-right corner for "Sign Out" button)
- Try signing out and signing back in
- Check browser console for any auth errors

## Security Note

For production use, you should:
- Keep email confirmation enabled
- Use strong passwords
- Consider adding additional auth providers (Google, etc.)
- Set up proper email templates

For development, disabling email confirmation is fine for testing.

