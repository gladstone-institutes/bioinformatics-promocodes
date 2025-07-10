# Partner URL Column Missing - Issue & Solution

## Problem
The CI validation is failing because the "Partner URL" column is missing from the Google Apps Script response:

```
Found 9 events
Validation failed:
  - Event 1 (Introduction to R Data Analysis): Missing column "Partner URL"
  - Event 2 (Introduction to Experimental Design and Hypothesis Testing): Missing column "Partner URL"
  [... all events missing Partner URL column]
```

## Root Cause
The Google Apps Script was hardcoded to read only 11 columns from the Google Sheet:

```javascript
// OLD CODE (PROBLEMATIC)
const data = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
```

If the "Partner URL" column is in position 12 or later, it gets truncated and doesn't appear in the API response.

## Solution
Updated the Google Apps Script to dynamically read all columns using `getLastColumn()`:

```javascript
// NEW CODE (FIXED)
const lastCol = sheet.getLastColumn();
const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
```

## Required Action
**The fix is already committed to this repository, but you must manually update the deployed Google Apps Script:**

1. Go to [script.google.com](https://script.google.com)
2. Open your existing Apps Script project
3. Copy the updated code from `google-apps-script.js` in this repository
4. Paste it into the Apps Script editor
5. Save and redeploy:
   - Click "Save" (Ctrl+S)
   - Click "Deploy" → "Manage deployments"
   - Click edit icon next to existing deployment
   - Change "Version" to "New version"
   - Click "Deploy"

## Verification
After redeploying, the CI validation should pass and all 7 required columns should be present:
- Title
- Date  
- EDU code
- Partner code
- General URL
- EDU URL
- Partner URL

## Debug Script
Use the `debug-columns.js` script in the Apps Script editor to verify all columns are being read correctly. 