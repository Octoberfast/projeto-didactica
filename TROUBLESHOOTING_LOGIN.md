# Troubleshooting: Login Issues

## Problem
Users experiencing "Failed to fetch" error when trying to login in the deployed application.

## Root Cause
The issue occurs because environment variables are not configured in the production environment (Netlify). While the application works locally using `.env.local`, the deployed version doesn't have access to these variables.

## Required Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Solutions

### 1. Configure Environment Variables in Netlify
1. Access your Netlify dashboard: https://app.netlify.com/sites
2. Select your site or create a new one
3. Go to Site settings > Environment variables
4. Click "Add a variable" for each required variable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy your application (automatic if connected to Git)

### 2. Verify Supabase Configuration
- Ensure your Supabase project is active
- Check if the URL and keys are correct
- Verify RLS policies are properly configured

### 3. Test with Debug Component
Use the `SupabaseDebug` component to verify connection:
```tsx
import { SupabaseDebug } from '@/components/SupabaseDebug'

// Add to your login page temporarily
<SupabaseDebug />
```

## Next Steps
1. Run the setup script: `node scripts/setup-netlify-env.js`
2. Follow the instructions to configure variables in Netlify
3. Deploy your application
4. Test the login functionality

## Useful Commands
```bash
# Check environment variables locally
cat .env.local

# Run the Netlify setup script
node scripts/setup-netlify-env.js

# Build and test locally
npm run build
npm run preview

# Install Netlify CLI (optional)
npm install -g netlify-cli

# Manual deploy with Netlify CLI
netlify deploy --prod --dir=dist
```

## Netlify-Specific Configuration
- The project includes `netlify.toml` with optimized build settings
- Netlify automatically detects Vite projects
- Build command: `npm run build`
- Publish directory: `dist`
- Redirects are configured for SPA routing

## Important Notes
- Never commit `.env.local` to version control
- Environment variables in Netlify are case-sensitive
- Changes to environment variables trigger automatic redeployment (if connected to Git)
- Local development uses `.env.local`, production uses Netlify environment variables
- Netlify provides better performance and CDN compared to other platforms