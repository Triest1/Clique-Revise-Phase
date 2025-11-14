# Vercel Deployment Guide

## Quick Fix for 404 Errors

The 404 error you're seeing is because Vercel doesn't know how to handle client-side routing in React apps. I've created the necessary configuration files to fix this.

## Files Created/Updated

1. **`vercel.json`** - Main Vercel configuration
2. **`public/_redirects`** - Backup redirect configuration
3. **`vite.config.js`** - Updated build configuration

## Deployment Steps

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment routing"
   git push
   ```

2. **Redeploy on Vercel:**
   - Go to your Vercel dashboard
   - Click "Redeploy" on your project
   - Or push to your connected Git repository

3. **Verify the fix:**
   - Try accessing `/login` again
   - All routes should now work properly

## What the Fix Does

- **`vercel.json`**: Tells Vercel to serve `index.html` for all routes, allowing React Router to handle client-side routing
- **`_redirects`**: Backup solution for redirects
- **Updated Vite config**: Optimizes build output for better performance

## Testing Routes

After deployment, these routes should all work:
- `/` - Home page
- `/login` - Login page
- `/about` - About page
- `/events` - Events page
- `/contact` - Contact page
- `/admin` - Admin dashboard (requires login)
- `/staff` - Staff dashboard (requires login)

## Troubleshooting

If you still get 404 errors:
1. Check that `vercel.json` is in your project root
2. Ensure you're using the correct build command: `npm run build`
3. Verify the build output directory is `dist`
4. Check Vercel's deployment logs for any errors

## Build Command

Vercel should automatically detect and use:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
