# Logging Debug Checklist

## Step 1: Verify Google Apps Script Setup

### A. Check Spreadsheet ID
- [ ] Open your Google Sheet
- [ ] Copy the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
- [ ] In Google Apps Script, verify the `spreadsheetId` variable matches exactly
- [ ] Current value in script: `'ADD_SHEET_ID'` ← **This needs to be replaced!**

### B. Check Sheet Names
- [ ] Verify you have a sheet named exactly `"Logs"` (case-sensitive)
- [ ] If missing, create it manually or run `createLogsSheetIfMissing()` function

### C. Test Apps Script Manually
1. [ ] Copy the debug script from `debug-logging-test.js` into your Google Apps Script
2. [ ] Replace `'ADD_SHEET_ID'` with your actual spreadsheet ID
3. [ ] Run `runAllTests()` function
4. [ ] Check the console output for errors

## Step 2: Verify Apps Script Deployment

### A. Check Deployment
- [ ] In Google Apps Script, go to Deploy > Manage deployments
- [ ] Verify you have an active web app deployment
- [ ] Copy the deployment URL
- [ ] Make sure the URL matches what's in your GitHub secrets

### B. Test Deployment URL
- [ ] Try accessing your Apps Script URL directly in browser
- [ ] Should return JSON with events data
- [ ] If it doesn't work, redeploy the web app

## Step 3: Check Frontend Integration

### A. Verify Configuration
- [ ] Open your deployed site in browser
- [ ] Open browser console (F12)
- [ ] Check if config is loaded: `console.log(window.APP_CONFIG)`
- [ ] Verify `GOOGLE_SHEETS.APPS_SCRIPT_URL` is set correctly

### B. Test Frontend Logging
- [ ] Submit a promo code request
- [ ] Check browser console for debug messages:
  - `[DEBUG] logRequest: category: ...`
  - `[DEBUG] Log data being sent: ...`
  - `[DEBUG] logRequest: fetch result: ...`

### C. Check Network Requests
- [ ] Open browser DevTools > Network tab
- [ ] Submit a promo code request
- [ ] Look for POST request to your Apps Script URL
- [ ] Check the request payload and response

## Step 4: Common Issues & Solutions

### Issue: "ADD_SHEET_ID" not replaced
**Solution:** Replace `'ADD_SHEET_ID'` with your actual Google Sheet ID in the Apps Script

### Issue: "Logs" sheet doesn't exist
**Solution:** Create it manually or run `createLogsSheetIfMissing()` function

### Issue: Apps Script not deployed
**Solution:** 
1. Go to Deploy > New deployment
2. Choose "Web app" type
3. Set execute as "Me"
4. Set access to "Anyone"
5. Deploy and copy the URL

### Issue: Permission errors
**Solution:** 
1. Run any function in Apps Script manually first
2. Grant permissions when prompted
3. Make sure the script has access to Google Sheets

### Issue: Frontend not sending requests
**Solution:**
1. Check GitHub secrets are set correctly
2. Verify the site is using the deployed config
3. Check browser console for JavaScript errors

## Step 5: Debug Output Examples

### Successful logging should show:
```
[DEBUG] logRequest: category: partner promoCode: GLAD50 registrationUrl: https://...
[DEBUG] Log data being sent: {email: "test@gladstone.org", affiliation: "Gladstone", ...}
[DEBUG] logRequest: fetch result: {status: "success", message: "Request logged successfully"}
```

### Apps Script console should show:
```
✅ Spreadsheet opened successfully
✅ Sheet found
Logged request: ["2024-01-15T10:30:00.000Z", "test@gladstone.org", "Gladstone", ...]
```

## Step 6: Final Verification

- [ ] Check Google Sheet "Logs" tab
- [ ] Should see headers in row 1
- [ ] Should see log entries in subsequent rows
- [ ] Each entry should have: Timestamp, Email, Affiliation, Event ID, Event Title, Promo Code, Registration URL

## Still Having Issues?

1. **Check Apps Script Executions:**
   - Go to Google Apps Script > Executions
   - Look for recent executions and any error messages

2. **Enable detailed logging:**
   - Add more `Logger.log()` statements in your Apps Script
   - Check the logs after running functions

3. **Test with minimal data:**
   - Use the debug script to test with simple data first
   - Once that works, test with the full frontend integration 