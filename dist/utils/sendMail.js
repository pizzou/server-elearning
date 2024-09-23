"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config(); // Make sure .env variables are loaded
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail = async (options) => {
    // Create the transporter object using the correct host and port or service if needed
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST, // Custom SMTP server host
        port: parseInt(process.env.SMTP_PORT || '587', 10), // Parse port safely with fallback
        auth: {
            user: process.env.SMTP_MAIL, // Sender email address from environment
            pass: process.env.SMTP_PASSWORD, // Sender email password from environment
        },
    });
    const { email, subject, template, data } = options;
    // Path to the email template
    const templatePath = path_1.default.join(__dirname, '../mails', template);
    // Render the email template with EJS, catching potential errors
    let html;
    try {
        html = await ejs_1.default.renderFile(templatePath, data);
    }
    catch (error) {
        console.error('Error rendering email template:', error);
        throw new Error('Failed to render email template');
    }
    // Email options
    const mailOptions = {
        from: process.env.SMTP_MAIL, // Sender email address
        to: email, // Recipient email
        subject, // Email subject
        html, // Rendered HTML content
    };
    // Send email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
exports.default = sendMail;
