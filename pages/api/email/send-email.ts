import type { NextApiRequest, NextApiResponse } from 'next';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_KEY as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to, mediaUrl} = req.body;

    if (!to  || !mediaUrl) {
        return res.status(400).json({ error: 'Missing required receipient' });
    }

    try {
        await sgMail.send({
            to: to, // Change to your recipient
            from: 'khoa.le@talentedge.ai', // Change to your verified sender
            subject: 'Your Travel Itinerary Summary',
            text: 'Here is a summary of your travel itinerary.',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4CAF50;">Your Travel Itinerary Summary</h2>
                <p>We have compiled a summary of your travel plans for your convenience.</p>
                <p>Thank you for using our service. Have a great trip!</p>
            </div>
            `,
        });
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send email' });
    }
}
