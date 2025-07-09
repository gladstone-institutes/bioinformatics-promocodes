# Configuration System Explanation

## How It Works

### GitHub Pages Deployment
- GitHub Actions replaces `config.js` with real values from secrets
- Site uses actual Google Apps Script and EmailJS
- All secrets are encrypted and secure

## File Flow

### GitHub Actions Deployment
```
GitHub Secrets → temp-config.js (real values) → config.js (replaced) → script.js (updated) → GitHub Pages
```

## Configuration Files

### config.js (Repository - Placeholders)
```javascript
// This file has placeholders that get replaced during deployment
window.APP_CONFIG = {
    GOOGLE_SHEETS: {
        APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL' // Placeholder
    },
    EMAIL_SERVICE: {
        SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID', // Placeholder
        TEMPLATE_ID: 'YOUR_EMAILJS_TEMPLATE_ID', // Placeholder
        API_KEY: 'YOUR_EMAILJS_API_KEY' // Placeholder
    },
    // ... more placeholders
};
```

### config.js (Production - Created by GitHub Actions)
```javascript
// This file is created during deployment with real values
window.APP_CONFIG = {
    GOOGLE_SHEETS: {
        APPS_SCRIPT_URL: 'https://script.google.com/macros/s/SCRIPT_ID/exec' // Real value
    },
    EMAIL_SERVICE: {
        SERVICE_ID: 'service_xxxxxxx', // Real value
        TEMPLATE_ID: 'template_xxxxxxx', // Real value
        API_KEY: 'user_xxxxxxxxxxxxxxxxxxxxxx' // Real value
    },
    // ... real values from secrets
};
```

## GitHub Secrets Required

| Secret Name | Purpose | Example |
|-------------|---------|---------|
| `GOOGLE_SCRIPT_URL` | Google Apps Script deployment URL | `https://script.google.com/macros/s/SCRIPT_ID/exec` |
| `EMAILJS_SERVICE_ID` | EmailJS service ID | `service_xxxxxxx` |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID | `template_xxxxxxx` |
| `EMAILJS_API_KEY` | EmailJS API key | `user_xxxxxxxxxxxxxxxxxxxxxx` |

## Email Template Variables

The EmailJS template uses these variables:
- `{{event_title}}` - Name of the workshop
- `{{promo_code}}` - The exclusive promo code
- `{{registration_url}}` - Link to registration
- `{{affiliation_message}}` - Personalized message based on affiliation
- `{{to_email}}` - Recipient's email address

## Security Benefits

- ✅ **No secrets in repository** - All sensitive data is in GitHub secrets
- ✅ **Encrypted storage** - GitHub encrypts all secrets
- ✅ **Automatic injection** - GitHub Actions handles the replacement
- ✅ **Production secure** - Real values only exist in deployed site

## Troubleshooting

### Production Issues
- Check GitHub Actions logs for secret injection errors
- Verify all 4 secrets are added to repository
- Check deployed site's browser console for errors

### Debug Commands
```javascript
// Check if config is loaded
console.log('Config loaded:', !!window.APP_CONFIG);

// Check if using real configuration
console.log('Using real config:', window.APP_CONFIG?.GOOGLE_SHEETS?.APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL');

// Test Apps Script connection
if (window.APP_CONFIG?.GOOGLE_SHEETS?.APPS_SCRIPT_URL) {
  fetch(window.APP_CONFIG.GOOGLE_SHEETS.APPS_SCRIPT_URL)
    .then(r => r.json())
    .then(data => console.log('Apps Script response:', data))
    .catch(err => console.error('Apps Script error:', err));
}
``` 