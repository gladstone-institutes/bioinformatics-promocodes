# Quick Reference: GitHub Secrets Setup

## GitHub Repository Secrets

Add these secrets to your repository: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `GOOGLE_SCRIPT_URL` | Google Apps Script deployment URL | `https://script.google.com/macros/s/SCRIPT_ID/exec` |
| `EMAILJS_SERVICE_ID` | EmailJS service ID | `service_xxxxxxx` |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID | `template_xxxxxxx` |
| `EMAILJS_API_KEY` | EmailJS API key | `user_xxxxxxxxxxxxxxxxxxxxxx` |

## How to Get Each Value

### Google Script URL
1. Deploy your Google Apps Script as web app
2. Copy the deployment URL
3. Format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`

### EmailJS Values
1. **Service ID**: EmailJS Dashboard → Email Services → Copy Service ID
2. **Template ID**: EmailJS Dashboard → Email Templates → Copy Template ID  
3. **API Key**: EmailJS Dashboard → Account → API Keys → Copy Public Key

## Email Template Variables

Your EmailJS template should use these variables:
- `{{event_title}}` - Name of the workshop
- `{{promo_code}}` - The exclusive promo code
- `{{registration_url}}` - Link to registration
- `{{affiliation_message}}` - Personalized message based on affiliation
- `{{to_email}}` - Recipient's email address

## Deployment Process

1. **Add all secrets** to GitHub repository
2. **Push changes** to main branch
3. **GitHub Actions** automatically:
   - Injects secrets into configuration
   - Deploys to GitHub Pages
4. **Test live site** at your GitHub Pages URL

## Security Benefits

- ✅ **No sensitive data** in repository
- ✅ **Encrypted secrets** in GitHub
- ✅ **Automatic injection** during build
- ✅ **Production deployment** uses real configuration

## Troubleshooting

### Secrets Not Working?
1. Check all 4 secrets are added
2. Verify secret names match exactly
3. Check GitHub Actions logs for errors
4. Ensure secrets are in the correct repository

### Debug Commands
```javascript
// Check if config is loaded
console.log('Config loaded:', !!window.APP_CONFIG);

// Test Apps Script connection
if (window.APP_CONFIG?.GOOGLE_SHEETS?.APPS_SCRIPT_URL) {
  fetch(window.APP_CONFIG.GOOGLE_SHEETS.APPS_SCRIPT_URL)
    .then(r => r.json())
    .then(data => console.log('Apps Script response:', data))
    .catch(err => console.error('Apps Script error:', err));
}
``` 