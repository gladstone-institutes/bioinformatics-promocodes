# Setup Guide: GitHub Pages + Google Apps Script + EmailJS

## Overview
This guide walks you through setting up the promo code management site for GitHub Pages deployment using Google Apps Script and EmailJS with GitHub secrets for secure configuration.

## Step 1: Google Sheets Setup

### 1.1 Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Bioinformatics Workshop Promo Codes"

### 1.2 Set up Events Tab
Create a tab called "Events" with these columns:
- **A1**: Event ID
- **B1**: Title  
- **C1**: Date
- **D1**: Promo Code
- **E1**: Registration URL

Example data:
```
Event ID | Title                    | Date       | Promo Code | Registration URL
1        | Introduction to Bioinformatics | 2024-03-15 | BIO2024    | https://example.com/register/bio2024
2        | Advanced Data Analysis   | 2024-03-22 | DATA2024   | https://example.com/register/data2024
```

### 1.3 Set up Logs Tab
Create a tab called "Logs". **Note: You don't need to add column headers manually** - the Google Apps Script will automatically add headers when the first log entry is created:
- **A1**: Timestamp
- **B1**: Email
- **C1**: Affiliation
- **D1**: Event ID
- **E1**: Event Title
- **F1**: Promo Code
- **G1**: Registration URL

### 1.4 Set up Domain Validation (Optional)
The system includes email domain validation based on affiliation. The domain validation requires the specified domain to appear as a **complete word** in the email domain (not in the username or as part of another word). For example:
- ✅ `user@gladstone.org` (valid for Gladstone)
- ✅ `user@subdomain.gladstone.edu` (valid for Gladstone)
- ❌ `gladstone@gmail.com` (invalid - "gladstone" is in username, not domain)
- ❌ `user@mygladstone.org` (invalid - "gladstone" is part of "mygladstone", not a complete word)

### 1.5 Get Spreadsheet ID
1. Click "Share" in the top right
2. Copy the URL
3. Extract the ID from the URL: `https://docs.google.com/spreadsheets/d/`**`YOUR_SPREADSHEET_ID`**`/edit`

## Step 2: Google Apps Script Setup

### 2.1 Create Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New project"
3. Name it "Bioinformatics Promo Codes"

### 2.2 Copy Repository Code
The Google Apps Script code is already provided in the repository file `google-apps-script.js`. Copy this code to your Apps Script project.

**Note**: The repository version uses `'ADD_SHEET_ID'` as a placeholder. You'll need to replace this with your actual spreadsheet ID in the next step.

### 2.3 Update Spreadsheet ID
Replace `'ADD_SHEET_ID'` with your actual spreadsheet ID from Step 1.4 in both the `getEventsData()` and `logRequest()` functions.

### 2.4 Deploy Apps Script
1. Click "Deploy" → "New deployment"
2. Choose "Web app"
3. Set "Execute as": "Me"
4. Set "Who has access": "Anyone"
5. Click "Deploy"
6. Copy the deployment URL

## Step 3: EmailJS Setup

**📖 For detailed EmailJS setup instructions, see: [`docs/emailjs-setup.md`](emailjs-setup.md)**

### Quick Setup Summary:
1. **Create EmailJS account** at [emailjs.com](https://emailjs.com)
2. **Add email service** (Gmail recommended)
3. **Create email template** with variables: `{{event_title}}`, `{{event_date}}`, `{{promo_code}}`, `{{registration_url}}`, `{{affiliation_message}}`, `{{to_email}}`
4. **Get your IDs**: Service ID, Template ID, and User ID
5. **Test the setup** in EmailJS dashboard

## Step 4: GitHub Secrets Setup

### 4.1 Add Repository Secrets
1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GOOGLE_APPS_SCRIPT_URL` | Your Apps Script deployment URL from Step 2.4 |
| `EMAILJS_SERVICE_ID` | Your EmailJS service ID from Step 3 |
| `EMAILJS_TEMPLATE_ID` | Your EmailJS template ID from Step 3 |
| `EMAILJS_API_KEY` | Your EmailJS API key from Step 3 |

### 4.2 Verify Secrets
Your repository should now have these secrets configured:
- ✅ `GOOGLE_APPS_SCRIPT_URL`
- ✅ `EMAILJS_SERVICE_ID`
- ✅ `EMAILJS_TEMPLATE_ID`
- ✅ `EMAILJS_API_KEY`

## Step 5: Deploy and Test

### 5.1 Push to GitHub
1. Commit and push your changes to the main branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. The secrets will be injected during the build process

### 5.2 Test Live Site
1. Visit your GitHub Pages URL
2. Test the form with real data
3. Check your Google Sheet's Logs tab for entries

## Updating Google Apps Script

When you make changes to the `google-apps-script.js` file in this repository, you need to manually update the deployed Google Apps Script:

1. **Open Google Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Find your project**: Open the project you created during initial setup
3. **Update the code**: Copy the updated code from `google-apps-script.js` and paste it into the Apps Script editor
4. **Save and deploy**: 
   - Click "Save" (Ctrl+S)
   - Click "Deploy" → "Manage deployments"
   - Click the edit icon (pencil) next to your existing deployment
   - Change "Version" to "New version"
   - Click "Deploy"
5. **Test the changes**: The updated script should now be live at your deployment URL

### Recent Critical Fix

**Issue**: The Partner URL column was missing from event data because the script was hardcoded to read only 11 columns.

**Solution**: Updated the script to use `getLastColumn()` to dynamically read all columns. This ensures all data is captured regardless of how many columns are in the sheet.

**Required Action**: You must redeploy the updated `google-apps-script.js` code to fix this issue.

## Troubleshooting

### Common Issues:

1. **Secrets Not Found**: Make sure all secrets are added to GitHub repository settings
2. **CORS Errors**: Apps Script handles this automatically
3. **Permission Denied**: Make sure Apps Script is deployed with "Anyone" access
4. **Email Not Sending**: Check EmailJS configuration and template variables
5. **Events Not Loading**: Verify Apps Script deployment URL

### Debug Commands:

Test Apps Script directly:
```javascript
fetch('[YOUR_APPS_SCRIPT_URL]').then(r => r.json()).then(console.log)
```

Check if config is loaded:
```javascript
console.log(window.APP_CONFIG);
```

## Security Notes

- ✅ GitHub secrets are encrypted and secure
- ✅ No sensitive data in the repository
- ✅ Apps Script URL is public but secure
- ✅ EmailJS handles email security
- ✅ All sensitive data stays in Google's ecosystem

## Troubleshooting Logging Issues

### If the Logs sheet is empty:

1. **Check the sheet name**: Make sure you have a sheet named exactly "Logs" (case-sensitive)

2. **Test logging manually**: Copy the debug script from `debug-logging.js` into your Google Apps Script and run `testLogging()`

3. **Check Apps Script logs**: 
   - Go to Google Apps Script > Executions
   - Look for any error messages in the logs

4. **Verify frontend is sending data**: Open browser console and look for debug messages like:
   ```
   [DEBUG] logRequest: category: edu promoCode: EDU50 registrationUrl: https://...
   [DEBUG] Log data being sent: {email: "...", affiliation: "...", ...}
   ```

5. **Check network requests**: In browser DevTools > Network tab, look for POST requests to your Apps Script URL

### Common issues:
- **Missing "Logs" sheet**: Create it manually if it doesn't exist
- **Wrong spreadsheet ID**: Verify the ID in your Apps Script matches your Google Sheet
- **Apps Script not deployed**: Make sure you've deployed the script as a web app
- **Permission issues**: Apps Script needs permission to write to the sheet
- **CORS errors**: Make sure your Apps Script includes CORS headers (handled automatically in the provided code)

## Next Steps

1. **Add real events**: Update your Google Sheet with actual events
2. **Monitor logs**: Check the Logs tab for user activity
3. **Customize emails**: Update the EmailJS template as needed
4. **Add analytics**: Consider adding Google Analytics for usage tracking 