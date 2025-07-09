# Bioinformatics Workshop Promo Codes

A simple web application for managing and distributing promo codes for upcoming bioinformatics workshops. Users can select an event, provide their affiliation and email, and receive a personalized promo code via email.

## Features

- **Event Selection**: Dropdown menu of upcoming workshops
- **Affiliation Validation**: Predefined categories for user affiliation
- **Email Integration**: Automated email delivery of promo codes
- **Google Sheets Integration**: Dynamic event loading and request logging
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### 1. Google Sheets Configuration

1. Create a Google Sheet with the following structure:
   - **Events Tab**: Columns for Event ID, Title, Date, Promo Code, Registration URL
   - **Logs Tab**: Columns for Timestamp, Email, Affiliation, Event ID, Event Title, Promo Code

2. Enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create credentials (API Key)

### 2. Email Service Setup

The application uses EmailJS for email delivery. To set up:

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Update the `EMAIL_CONFIG` in `script.js`

### 3. Environment Configuration

Update the configuration in `script.js`:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    spreadsheetId: 'YOUR_GOOGLE_SHEET_ID',
    apiKey: 'YOUR_GOOGLE_API_KEY'
};

const EMAIL_CONFIG = {
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
    userId: 'YOUR_EMAILJS_USER_ID'
};
```

## Development

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. For Google Sheets integration, you'll need to set up CORS or use a proxy

### Debug Mode

Enable debug logging by setting the `DEBUG` environment variable:

```bash
DEBUG=promocodes
```

## Deployment

The site is configured for GitHub Pages deployment. Simply push to the main branch and the site will be automatically deployed.

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── config.js           # Configuration file
├── test.html           # Test page
├── .github/workflows/  # GitHub Actions deployment
├── README.md           # This file
└── docs/              # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 