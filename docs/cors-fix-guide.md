# Fixing CORS Error: "Access to fetch blocked by CORS policy"

## The Problem

When accessing your deployed site, you see this error in the browser console:
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'https://gladstone-institutes.github.io' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means your Google Apps Script isn't allowing requests from your GitHub Pages domain.

## The Solution

The CORS error occurs because your Google Apps Script web app deployment needs to be configured correctly. Follow these steps:

### Step 1: Verify Your Google Apps Script Deployment

1. **Go to Google Apps Script**: [script.google.com](https://script.google.com)
2. **Open your project**: Find the "Bioinformatics Promo Codes" project
3. **Check deployment settings**:
   - Click **"Deploy"** → **"Manage deployments"**
   - Find your active deployment
   - Click the **edit icon** (pencil) next to it

### Step 2: Update Deployment Settings

Make sure your deployment has these exact settings:

- **Execute as**: `Me` (your account)
- **Who has access**: `Anyone` ← **This is critical!**
- **Version**: `New version` (when updating)

### Step 3: Redeploy the Script

1. If you need to update the code:
   - Make sure you've copied the latest code from `google-apps-script.js` in this repository
   - Click **"Save"** (Ctrl+S or Cmd+S)
   
2. **Create a new deployment version**:
   - Click **"Deploy"** → **"Manage deployments"**
   - Click the **edit icon** (pencil) next to your deployment
   - Change **"Version"** from "Current version" to **"New version"**
   - Click **"Deploy"**

3. **Copy the new deployment URL** (if it changed)

### Step 4: Update GitHub Secret (if URL changed)

If the deployment URL changed:

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Find the `GOOGLE_SCRIPT_URL` secret
4. Click **"Update"** and paste the new deployment URL
5. Save the secret

### Step 5: Trigger a New Deployment

1. Go to your GitHub repository
2. **Actions** tab
3. Click **"Deploy static content to GitHub Pages"**
4. Click **"Run workflow"** → **"Run workflow"** (to manually trigger)

### Step 6: Test Again

1. Wait for the GitHub Actions workflow to complete (usually 1-2 minutes)
2. Visit your site: `https://gladstone-institutes.github.io/bioinformatics-promocodes/`
3. Open browser console (F12)
4. Check if the CORS error is gone

## Why This Happens

Google Apps Script web apps automatically handle CORS **only when**:
- The deployment is set to **"Anyone"** access
- The script is deployed as a **web app** (not an API executable)
- The deployment is active and up-to-date

If any of these conditions aren't met, CORS errors will occur.

## Alternative: Test the Script Directly

To verify your Google Apps Script is working, test it directly in your browser:

1. Copy your Google Apps Script deployment URL
2. Paste it directly in your browser's address bar
3. You should see JSON output like:
   ```json
   {"status":"success","data":[...]}
   ```

If this works but your website still has CORS errors, the issue is definitely the deployment settings (Step 2 above).

## Still Having Issues?

If you've followed all steps and still see CORS errors:

1. **Check the deployment URL format**: It should be:
   ```
   https://script.google.com/macros/s/[SCRIPT_ID]/exec
   ```
   (Not `/dev` or any other path)

2. **Verify "Anyone" access**: This is the most common issue. The deployment MUST be set to "Anyone" access, not "Only myself" or "Anyone with Google account".

3. **Try creating a completely new deployment**:
   - Delete the old deployment
   - Create a brand new deployment
   - Make sure to set "Anyone" access
   - Update the GitHub secret with the new URL

4. **Check browser console for other errors**: Sometimes there are multiple issues. Clear the console and reload to see if CORS is the only problem.

## Quick Checklist

- [ ] Google Apps Script is deployed as a **web app**
- [ ] Deployment is set to **"Anyone"** access (not "Only myself")
- [ ] Deployment is set to **"Execute as: Me"**
- [ ] Latest code is saved in Apps Script
- [ ] Deployment version is updated (if code changed)
- [ ] GitHub secret `GOOGLE_SCRIPT_URL` matches the deployment URL
- [ ] GitHub Actions workflow has completed successfully
- [ ] Browser cache is cleared (try hard refresh: Ctrl+Shift+R or Cmd+Shift+R)

