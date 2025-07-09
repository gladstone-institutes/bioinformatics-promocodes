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

class PromoCodeManager {
    constructor() {
        this.events = [];
        this.currentEvent = null;

        // Enhanced debugging: print config at startup
        console.log('[DEBUG] window.APP_CONFIG:', window.APP_CONFIG);

        this.init();
    }

    async init() {
        debug('Initializing PromoCodeManager');
        await this.loadEvents();
        this.setupEventListeners();
    }

    async loadEvents() {
        try {
            debug('Loading events from Google Apps Script');

            // Enhanced debugging: print Apps Script URL
            const scriptUrl = window.APP_CONFIG?.GOOGLE_SHEETS?.APPS_SCRIPT_URL;
            console.log('[DEBUG] Apps Script URL:', scriptUrl);

            if (!scriptUrl || scriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_DEPLOYMENT_URL') {
                console.error('[DEBUG] Google Apps Script URL not configured or is placeholder:', scriptUrl);
                throw new Error('Google Apps Script URL not configured');
            }

            // Enhanced debugging: print fetch attempt
            console.log('[DEBUG] Fetching events from:', scriptUrl);
            const response = await fetch(scriptUrl);

            // Enhanced debugging: print response status
            console.log('[DEBUG] Fetch response status:', response.status);

            const result = await response.json();

            // Enhanced debugging: print response body
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
        
        this.events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.title} - ${new Date(event.date).toLocaleDateString()}`;
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
        this.currentEvent = this.events.find(e => e.id === eventId);
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

        this.setLoading(true);
        
        try {
            await this.processPromoCodeRequest(email, affiliation);
            this.showSuccess();
            await this.logRequest(email, affiliation);
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
        
        // Prepare template parameters
        const templateParams = {
            event_title: this.currentEvent.title,
            promo_code: this.currentEvent.promoCode,
            registration_url: this.currentEvent.registrationUrl,
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
        const messages = {
            academic: "As an academic participant, you're eligible for our special academic discount. Use the promo code above to register at the discounted rate.",
            industry: "We're excited to have industry professionals join our workshop. Your promo code provides access to our comprehensive industry track.",
            government: "Government participants are welcome! Your promo code includes access to our government-specific resources and networking opportunities.",
            nonprofit: "Non-profit organizations are important to our community. Your promo code includes additional resources for non-profit capacity building.",
            student: "Students are the future of bioinformatics! Your promo code includes access to student-specific resources and mentoring opportunities.",
            other: "We're glad to have you join our diverse community of learners. Your promo code provides full access to all workshop materials and resources."
        };
        
        return messages[affiliation] || messages.other;
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
            const logData = {
                email: email,
                affiliation: affiliation,
                eventId: this.currentEvent.id,
                eventTitle: this.currentEvent.title,
                promoCode: this.currentEvent.promoCode
            };
            
            const response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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