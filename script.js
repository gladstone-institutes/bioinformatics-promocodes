// Configuration will be injected by GitHub Actions from secrets
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL';

// Debug helper function
function debug(message, data = null) {
    if (typeof process !== 'undefined' && process.env && process.env.DEBUG && process.env.DEBUG.includes('promocodes')) {
        console.log(`[DEBUG] ${message}`, data);
    }
}

// Email service configuration (using EmailJS as an example)
const EMAIL_CONFIG = {
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
    apiKey: 'YOUR_EMAILJS_API_KEY'
};

console.log('SCRIPT LOADED'); // Confirm script is running

class PromoCodeManager {
    constructor() {
        this.events = [];
        this.currentEvent = null;
        this.affiliations = {};
        this.init();
    }

    async init() {
        await this.loadAffiliations();
        await this.loadEvents();
        this.setupEventListeners();
    }

    async loadAffiliations() {
        try {
            const response = await fetch('affiliations.txt');
            const text = await response.text();
            this.affiliations = this.parseAffiliations(text);
            this.populateAffiliationSelect();
        } catch (error) {
            console.error('[DEBUG] Failed to load affiliations.txt:', error);
            this.affiliations = {};
        }
    }

    parseAffiliations(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        const map = {};
        lines.forEach(line => {
            const [affiliation, message, category, domain] = line.split('|').map(s => s.trim());
            map[affiliation] = { message, category, domain: domain || '' };
        });
        return map;
    }

    populateAffiliationSelect() {
        const select = document.getElementById('affiliation');
        select.innerHTML = '<option value="">Select your affiliation...</option>';
        Object.keys(this.affiliations).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            select.appendChild(option);
        });
    }

    async loadEvents() {
        const select = document.getElementById('eventSelect');
        // Show loading state
        select.innerHTML = '<option>Loading events...</option>';
        select.disabled = true;
        try {
            debug('Loading events from Google Apps Script');

            // Always print Apps Script URL for debugging
            const scriptUrl = window.APP_CONFIG?.GOOGLE_SHEETS?.APPS_SCRIPT_URL;
            console.log('[DEBUG] Apps Script URL:', scriptUrl);

            if (!scriptUrl || scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL') {
                console.error('[DEBUG] Google Apps Script URL not configured or is placeholder:', scriptUrl);
                throw new Error('Google Apps Script URL not configured');
            }

            // Always print fetch attempt
            console.log('[DEBUG] Fetching events from:', scriptUrl);
            const response = await fetch(scriptUrl);

            // Always print response status
            console.log('[DEBUG] Fetch response status:', response.status);

            const result = await response.json();

            // Always print response body
            console.log('[DEBUG] Fetch response body:', result);

            if (result.status === 'success') {
                this.events = result.data;
                debug('Events loaded from Apps Script', this.events.length);
            } else {
                console.error('[DEBUG] Failed to load events from Apps Script:', result);
                throw new Error('Failed to load events from Apps Script');
            }

            this.populateEventSelect();
            debug('Events loaded successfully', this.events.length);
        } catch (error) {
            debug('Error loading events', error);
            console.error('[DEBUG] Error loading events:', error);
            this.showError('Failed to load events. Please check configuration.');
        }
    }

    populateEventSelect() {
        const select = document.getElementById('eventSelect');
        select.innerHTML = '<option value="">Choose an event...</option>';
        select.disabled = false;
        this.events.forEach((event, idx) => {
            const option = document.createElement('option');
            // Use EDU code as a unique value if available, otherwise fallback to index
            option.value = event["EDU code"] || event["Title"] || idx;
            // Show Title (Date) in the dropdown
            const dateStr = event["Date"] ? ` (${event["Date"]})` : '';
            option.textContent = `${event["Title"] || "Untitled Event"}${dateStr}`;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        const form = document.getElementById('promoForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        const eventSelect = document.getElementById('eventSelect');
        eventSelect.addEventListener('change', (e) => this.handleEventChange(e));
    }

    handleEventChange(event) {
        const eventId = event.target.value;
        // Find by EDU code or fallback to Title or index
        this.currentEvent = this.events.find(e => e["EDU code"] === eventId || e["Title"] === eventId);
        debug('Event selected', this.currentEvent);
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const email = formData.get('email') || document.getElementById('email').value;
        const affiliation = formData.get('affiliation') || document.getElementById('affiliation').value;
        
        debug('Form submission', { email, affiliation, event: this.currentEvent });

        if (!this.currentEvent) {
            this.showError('Please select an event.');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address.');
            return;
        }

        if (!affiliation) {
            this.showError('Please select your affiliation.');
            return;
        }

        // Validate email domain for the selected affiliation
        const domainValidation = this.validateEmailDomain(email, affiliation);
        if (!domainValidation.valid) {
            this.showError(domainValidation.message);
            return;
        }

        this.setLoading(true);
        
        try {
            await this.processPromoCodeRequest(email, affiliation);
            await this.logRequest(email, affiliation);
            this.showSuccess();
        } catch (error) {
            debug('Error processing request', error);
            this.showError('Failed to process your request. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateEmailDomain(email, affiliation) {
        const affiliationData = this.affiliations[affiliation];
        debug('Domain validation', { email, affiliation, affiliationData });
        
        if (!affiliationData || !affiliationData.domain) {
            // No domain requirement for this affiliation
            debug('No domain requirement for this affiliation');
            return { valid: true };
        }

        const requiredDomain = affiliationData.domain.toLowerCase();
        const emailLower = email.toLowerCase();
        
        // Extract the domain part (everything after @)
        const atIndex = emailLower.indexOf('@');
        if (atIndex === -1) {
            debug('Invalid email format - no @ symbol');
            return {
                valid: false,
                message: 'Invalid email format.'
            };
        }
        
        const domainPart = emailLower.substring(atIndex + 1);
        debug('Checking domain requirement', { requiredDomain, emailLower, domainPart });
        
        // Check if the required domain appears as a whole word in the domain part
        // Split domain by dots and check each part
        const domainParts = domainPart.split('.');
        const hasRequiredDomain = domainParts.some(part => part === requiredDomain);
        
        if (!hasRequiredDomain) {
            debug('Domain validation failed', { requiredDomain, domainPart, domainParts });
            return {
                valid: false,
                message: `For ${affiliation} affiliation, you must use an email address with "${requiredDomain}" as part of the domain.`
            };
        }
        
        debug('Domain validation passed');
        return { valid: true };
    }

    async processPromoCodeRequest(email, affiliation) {
        debug('Processing promo code request', { email, affiliation, event: this.currentEvent });
        
        // Send email via EmailJS
        await this.sendEmail(email, affiliation);
        
        debug('Promo code request processed successfully');
    }

    async sendEmail(email, affiliation) {
        debug('Sending email via EmailJS', { email, affiliation, event: this.currentEvent });
        
        // Use injected config from GitHub secrets
        const serviceId = window.APP_CONFIG?.EMAIL_SERVICE?.SERVICE_ID;
        const templateId = window.APP_CONFIG?.EMAIL_SERVICE?.TEMPLATE_ID;
        const apiKey = window.APP_CONFIG?.EMAIL_SERVICE?.API_KEY;
        
        if (!serviceId || !templateId || !apiKey) {
            throw new Error('EmailJS configuration not found');
        }
        
        // Initialize EmailJS
        emailjs.init(apiKey);

        // Determine promo code and registration URL based on affiliation category
        const category = this.getAffiliationCategory(affiliation);
        let promoCode = '';
        let registrationUrl = '';
        if (category === 'edu') {
            promoCode = this.currentEvent["EDU code"];
            registrationUrl = this.currentEvent["EDU URL"];
        } else if (category === 'partner') {
            promoCode = this.currentEvent["Partner code"];
            registrationUrl = this.currentEvent["Partner URL"];
        } else {
            promoCode = '';
            registrationUrl = this.currentEvent["General URL"];
        }
        console.log('[DEBUG] sendEmail: category:', category, 'promoCode:', promoCode, 'registrationUrl:', registrationUrl, 'event:', this.currentEvent);

        // Prepare template parameters
        const templateParams = {
            event_title: this.currentEvent["Title"] || '',
            promo_code: promoCode,
            registration_url: registrationUrl,
            affiliation_message: this.getAffiliationMessage(affiliation),
            to_email: email
        };
        
        debug('EmailJS template parameters', templateParams);
        
        try {
            const response = await emailjs.send(serviceId, templateId, templateParams);
            debug('Email sent successfully', response);
            return response;
        } catch (error) {
            debug('Email send failed', error);
            throw new Error(`Failed to send email: ${error.text || error.message}`);
        }
    }

    getAffiliationMessage(affiliation) {
        return this.affiliations[affiliation]?.message || this.affiliations['other']?.message || '';
    }

    getAffiliationCategory(affiliation) {
        return this.affiliations[affiliation]?.category || 'default';
    }

    async logRequest(email, affiliation) {
        debug('Logging request to Google Apps Script', { email, affiliation, event: this.currentEvent });
        
        // Use injected config from GitHub secrets
        const scriptUrl = window.APP_CONFIG?.GOOGLE_SHEETS?.APPS_SCRIPT_URL;
        
        if (!scriptUrl || scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL') {
            debug('Apps Script URL not configured, skipping log');
            return;
        }
        
        try {
            // Use the same logic as sendEmail for promo code and registration URL
            const category = this.getAffiliationCategory(affiliation);
            let promoCode = '';
            let registrationUrl = '';
            if (category === 'edu') {
                promoCode = this.currentEvent["EDU code"] || '';
                registrationUrl = (this.currentEvent["EDU URL"] && this.currentEvent["EDU URL"].trim() !== '') ? this.currentEvent["EDU URL"] : (this.currentEvent["General URL"] || '');
            } else if (category === 'partner') {
                promoCode = this.currentEvent["Partner code"] || '';
                registrationUrl = (this.currentEvent["Partner URL"] && this.currentEvent["Partner URL"].trim() !== '') ? this.currentEvent["Partner URL"] : (this.currentEvent["General URL"] || '');
            } else {
                promoCode = '';
                registrationUrl = this.currentEvent["General URL"] || '';
            }

            const logData = {
                email: email,
                affiliation: affiliation,
                eventId: this.currentEvent["EDU code"] || '',
                eventTitle: this.currentEvent["Title"] || '',
                promoCode: promoCode,
                registrationUrl: registrationUrl
            };
            debug('Log data being sent:', logData);
            
            // Use POST request for logging (proper HTTP method for writing data)
            const response = await fetch(scriptUrl, {
                method: 'POST',
                body: JSON.stringify(logData)
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                debug('Request logged successfully');
            } else {
                throw new Error('Failed to log request');
            }
        } catch (error) {
            debug('Error logging request', error);
            // Don't show error to user for logging failures
        }
    }

    setLoading(loading) {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    showSuccess() {
        document.getElementById('result').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('promoForm').reset();
        this.currentEvent = null;
    }

    showError(message) {
        document.getElementById('errorText').textContent = message;
        document.getElementById('error').style.display = 'block';
        document.getElementById('result').style.display = 'none';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM loaded, initializing application');
    new PromoCodeManager();
}); 