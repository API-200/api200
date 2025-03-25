import { captureException } from '@sentry/node';
import axios from 'axios';

export async function sendEmailWithHTML(to: string, subject: string, htmlContent: string) {
    try {
        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: {
                name: process.env.EMAIL_SENDER_NAME,
                email: process.env.EMAIL_SENDER_EMAIL
            },
            to: [
                {
                    email: to
                }
            ],
            subject,
            htmlContent
        }, {
            headers: {
                'api-key': process.env.BREVO_API_KEY
            }
        });
    }
    catch (e) {
        captureException(e);
    }
}