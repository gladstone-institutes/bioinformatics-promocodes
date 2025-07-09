// Configuration file for GitHub Pages deployment
// This file is replaced by GitHub Actions with actual secret values
// All configuration comes from GitHub repository secrets

window.APP_CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        APPS_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL' // Set as GOOGLE_SCRIPT_URL secret
    },
    
    // Email Service Configuration
    EMAIL_SERVICE: {
        SERVICE_ID: 'YOUR_EMAILJS_SERVICE_ID', // Set as EMAILJS_SERVICE_ID secret
        TEMPLATE_ID: 'YOUR_EMAILJS_TEMPLATE_ID', // Set as EMAILJS_TEMPLATE_ID secret
        API_KEY: 'YOUR_EMAILJS_API_KEY' // Set as EMAILJS_API_KEY secret
    },
    
    // Application Settings
    APP: {
        DEBUG: false,
        MAX_REQUESTS_PER_HOUR: 10,
        EMAIL_DOMAIN_WHITELIST: []
    }
}; 