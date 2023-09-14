import twilio from 'twilio';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const twilioPayload = req.body;

        // Setup Twilio client
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Send an SMS
        await client.messages.create({
            body: 'A Twilio error occurred.',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.MY_PHONE_NUMBER
        });

        res.status(200).json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}