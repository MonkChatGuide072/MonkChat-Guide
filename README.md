# MonkChat Guide

## Cloudflare Pages Deployment

1. **Connect Repository**: In Cloudflare Pages, connect your GitHub repository and select the `main` branch.
2. **Build Settings**:
   - **Framework preset**: `None` or `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. **Environment Variables**:
   Add the following variables to your Cloudflare Pages production environment:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. **Deploy**: Trigger the initial deployment.

## Supabase Auth Configuration

After deploying to Cloudflare Pages, you must update your Supabase Auth settings to recognize the new production URL:
1. Go to your Supabase Dashboard -> **Authentication** -> **URL Configuration**.
2. **Site URL**: Change the Site URL to your Cloudflare Pages production domain (e.g., `https://monkchat-guide.pages.dev`).
3. **Redirect URLs**: Add your production domain to the allowed Redirect URLs to ensure successful login flows.
