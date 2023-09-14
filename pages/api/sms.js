import storeEmbedding from "@/lib/storeEmbedding";
import supabaseClient from "@/lib/supabaseClient";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const successMessages = [
  "Copy.",
  "All set.",
  "Note saved.",
  "Got it.",
  "Noted.",
];

export default async function handler(req, res) {
  const twilioSignature = req.headers["x-twilio-signature"];
  const params = req.body;
  //const url = 'https://25c5-146-115-84-234.ngrok-free.app/api/sms'
  const url = "https://notes.noodleai.app/api/sms";

  // Verify twilio request
  if (twilio.validateRequest(authToken, twilioSignature, url, params)) {
    const { Body: body, From: from } = req.body; // the body of the SMS message and the phone number it was sent from

    const metadata = {
      channel: "sms",
      //category: category,
      //userAgent: navigator.userAgent,
      //platform: navigator.platform,
      location: {
        lat: null,
        lon: null,
      },
    };

    // Look up the user based on the phone number
    let { data: user, error } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("phone_number", from)
      .single();

    if (error || !user) {
      console.log("Could not find user");
      res.status(400).json({ error: "Could not find user" });
      return;
    }
    console.log("Found user", user.id);

    try {
      const note = await storeEmbedding(user.id, body, metadata, null);

      // If everything went well, send a 200 response with TwiML
      const twiml = new twilio.twiml.MessagingResponse();
      const randomMessage =
        successMessages[Math.floor(Math.random() * successMessages.length)];
      twiml.message(randomMessage);
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    } catch (error) {
      res.status(400).json({ error: "Could not insert note" });

      // If things didn't got well, send a 400 response with TwiML
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(
        "Sorry, something went wrong. Please try again later. [Error 400]",
      );
      res.writeHead(400, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    }
  } else {
    console.log("Invalid request");
    res.status(400).json({ error: "Invalid request" });
  }
}
