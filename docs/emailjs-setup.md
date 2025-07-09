# EmailJS Setup Guide

## Overview
EmailJS allows you to send emails directly from your website without a backend server. This guide walks you through setting up EmailJS for the promo code management site.

## Step 1: Create EmailJS Account

### 1.1 Sign Up
1. Go to [emailjs.com](https://emailjs.com)
2. Click "Sign Up" or "Get Started"
3. Choose your signup method:
   - **Google** (recommended for simplicity)
   - **Email** (create account with email/password)
4. Complete the registration process

### 1.2 Verify Your Account
- Check your email for verification link
- Click the verification link to activate your account
- Log in to your EmailJS dashboard

## Step 2: Add Email Service

### 2.1 Choose Email Provider
1. In your EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:

**Recommended Options:**
- **Gmail** (easiest setup)
- **Outlook/Hotmail**
- **Yahoo**
- **Custom SMTP** (for business emails)

### 2.2 Configure Gmail (Recommended)
1. Select **"Gmail"** from the service list
2. Click **"Connect Account"**
3. Sign in with your Gmail account
4. Grant permissions to EmailJS
5. **Note the Service ID** (format: `service_xxxxxxx`)

### 2.3 Configure Other Providers
For other providers, you'll need:
- **SMTP Host** (e.g., smtp.gmail.com)
- **SMTP Port** (usually 587 or 465)
- **Username** (your email address)
- **Password** (your email password or app password)

## Step 3: Create Email Template

### 3.1 Create Template
1. Go to **"Email Templates"** in your dashboard
2. Click **"Create New Template"**
3. Give it a name: **"Promo Code Email"**

### 3.2 Template Configuration
Fill in the template details:

**Template Name:** `Promo Code Email`

**Subject:** `Your Promo Code for {{event_title}}`

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Promo Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c5aa0;">Your Promo Code is Ready!</h2>
        
        <p>Dear Participant,</p>
        
        <p>Thank you for your interest in our upcoming workshop!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> {{event_title}}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">Your Exclusive Promo Code</h3>
            <p style="font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 10px 0;">
                {{promo_code}}
            </p>
            <p style="text-align: center;">
                <a href="{{registration_url}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Register Now
                </a>
            </p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #856404;">Special Message</h3>
            <p>{{affiliation_message}}</p>
        </div>
        
        <p>We look forward to seeing you at the workshop!</p>
        
        <p>Best regards,<br>
        The Bioinformatics Workshop Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
            This email was sent to {{to_email}}. If you have any questions, please contact us.
        </p>
    </div>
</body>
</html>
```

### 3.3 Template Variables
The template uses these variables:
- `{{event_title}}` - Name of the workshop
- `{{promo_code}}` - The exclusive promo code
- `{{registration_url}}` - Link to registration
- `{{affiliation_message}}` - Personalized message based on affiliation
- `{{to_email}}` - Recipient's email address

### 3.4 Save Template
1. Click **"Save"** to create the template
2. **Note the Template ID** (format: `template_xxxxxxx`)

## Step 4: Get API Keys

### 4.1 Access API Keys
1. Go to **"Account"** in your dashboard
2. Click **"API Keys"**
3. You'll see your **Public Key** (format: `user_xxxxxxxxxxxxxxxxxxxxxx`)

### 4.2 Copy Your Keys
Note down these three values:
- **Service ID**: `service_xxxxxxx`
- **Template ID**: `template_xxxxxxx`
- **API Key**: `user_xxxxxxxxxxxxxxxxxxxxxx`

## Step 5: Test EmailJS Setup

### 5.1 Test in EmailJS Dashboard
1. Go to **"Email Templates"**
2. Find your template and click **"Test"**
3. Fill in test values:
   - `event_title`: "Test Workshop"
   - `promo_code`: "TEST2024"
   - `registration_url`: "https://example.com/register"
   - `affiliation_message`: "Test message"
   - `to_email`: "your-email@example.com"
4. Click **"Send Test Email"**
5. Check your email for the test message

### 5.2 Verify Email Received
- Check your inbox for the test email
- Verify the formatting looks correct
- Confirm all variables are populated

## Step 6: Add to GitHub Secrets

### 6.1 Add Repository Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these three secrets:

| Secret Name | Value |
|-------------|-------|
| `EMAILJS_SERVICE_ID` | Your Service ID (e.g., `service_xxxxxxx`) |
| `EMAILJS_TEMPLATE_ID` | Your Template ID (e.g., `template_xxxxxxx`) |
| `EMAILJS_API_KEY` | Your API Key (e.g., `user_xxxxxxxxxxxxxxxxxxxxxx`) |

### 6.2 Verify Secrets
Your repository should now have:
- ✅ `EMAILJS_SERVICE_ID`
- ✅ `EMAILJS_TEMPLATE_ID`
- ✅ `EMAILJS_API_KEY`

## Step 7: Update JavaScript (Optional)

### 7.1 Current Implementation
The site currently simulates email sending. To enable real EmailJS:

1. **Install EmailJS SDK** (add to `index.html`):
```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

2. **Update script.js** to use EmailJS:
```javascript
// Initialize EmailJS
emailjs.init(window.APP_CONFIG.EMAIL_SERVICE.API_KEY);

// Send email function
async function sendEmail(email, affiliation) {
    const templateParams = {
        event_title: this.currentEvent.title,
        promo_code: this.currentEvent.promoCode,
        registration_url: this.currentEvent.registrationUrl,
        affiliation_message: this.getAffiliationMessage(affiliation),
        to_email: email
    };

    try {
        const response = await emailjs.send(
            window.APP_CONFIG.EMAIL_SERVICE.SERVICE_ID,
            window.APP_CONFIG.EMAIL_SERVICE.TEMPLATE_ID,
            templateParams
        );
        
        console.log('Email sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Email send failed:', error);
        throw error;
    }
}
```

## Troubleshooting

### Common Issues:

1. **"Service not found"**
   - Check your Service ID is correct
   - Verify the email service is properly connected

2. **"Template not found"**
   - Check your Template ID is correct
   - Verify the template is saved and published

3. **"API Key invalid"**
   - Check your API Key is correct
   - Ensure you're using the Public Key, not Private Key

4. **"Email not sending"**
   - Check browser console for errors
   - Verify all template variables are provided
   - Test with EmailJS dashboard first

### Debug Commands:
```javascript
// Test EmailJS connection
console.log('EmailJS config:', window.APP_CONFIG.EMAIL_SERVICE);

// Test template variables
const testParams = {
    event_title: 'Test Event',
    promo_code: 'TEST123',
    registration_url: 'https://example.com',
    affiliation_message: 'Test message',
    to_email: 'test@example.com'
};
console.log('Template params:', testParams);
```

## Next Steps

1. **Test the setup** with the EmailJS dashboard
2. **Add secrets** to GitHub repository
3. **Deploy and test** the live site
4. **Monitor email delivery** in EmailJS dashboard
5. **Customize template** as needed for your branding 