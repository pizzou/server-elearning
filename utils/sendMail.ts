require('dotenv').config(); // Make sure .env variables are loaded

import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
    // Create the transporter object using the correct host and port or service if needed
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // Custom SMTP server host
        port: parseInt(process.env.SMTP_PORT || '587', 10), // Parse port safely with fallback
        auth: {
            user: process.env.SMTP_MAIL,  // Sender email address from environment
            pass: process.env.SMTP_PASSWORD,  // Sender email password from environment
        },
    });

    const { email, subject, template, data } = options;

    // Path to the email template
    const templatePath = path.join(__dirname, '../mails', template);

    // Render the email template with EJS, catching potential errors
    let html: string;
    try {
        html = await ejs.renderFile(templatePath, data);
    } catch (error) {
        console.error('Error rendering email template:', error);
        throw new Error('Failed to render email template');
    }

    // Email options
    const mailOptions = {
        from: process.env.SMTP_MAIL,  // Sender email address
        to: email,  // Recipient email
        subject,  // Email subject
        html,  // Rendered HTML content
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

export default sendMail;
