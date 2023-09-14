import supabaseClient from '@/lib/supabaseClient';
import twilio from 'twilio';

export default async function handler(req, res) {
  const { userId } = req.body

  // Update the profiles table
  const { error } = await supabaseClient
    .from('profiles')
    .update({ enrolled_sms: true })
    .eq('id', userId)

  if (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }

  // Send welcome SMS
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  const user = await supabaseClient
    .from('profiles')
    .select(`first_name, phone_number`)
    .eq('id', userId)
    .single()

  if (user.error || !user.data) {
    console.error(user.error)
    return res.status(500).json({ error: user.error?.message })
  }

 const sms = await client.messages.create({
    body: `👋 Greetings from Noodle, ${user.data.first_name}. Your phone number is enrolled in Text2Noodle. Send notes to this number and they'll be saved immediately. More info & terms: https://www.noodleai.app/documentation#text2noodle.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.data.phone_number
  });

  if (sms.error) {
    console.error(sms.error)
    return res.status(500).json({ error: sms.error.message })
  }

  res.status(200).json({ success: true })
}