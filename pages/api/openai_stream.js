import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = { 
    runtime: "edge",
};

export default async function handler(req) {
    try {
        const {concatenatedContent, messageHistoryContent, prompt_user} = await req.json();
        
        let messageHistorySection = "";
        if (messageHistoryContent) {
            messageHistorySection = `\n\nRecent conversation history for secondary context:\n${messageHistoryContent}`;
        }

        const prompt_system = `You are a friendly, matter-of-fact AI assistant. Format your responses as markdown. I have the following personal notes for context for you. Please prioritize these in your response. Use the information provided in the context to generate a summary. Make sure to pay attention to any keywords provided by the user:\n\n${concatenatedContent}${messageHistorySection}. 
        
        \n\nPlease be sure include any links from the context above in your response, and remember to be as accurate to the provided context in your summarization as possible. 
        
        \n\nIf the user asks you to summarize their notes, and the notes are highly unrelated or do not make sense, respond with this exactly: "It looks like your notes cover a variety of topics. Could you provide some more context, such as a date range or a topic, so that I can provide a more accurate summary? In the meantime, here is a summary of your notes:" [brief_summary]

        \n\nIf there are no notes that match the provided topic, please respond with this exactly: "I don't see any notes on that. Perhaps you could provide some context or rephrase your query?"

        \n\nIf it is not possible to be accurate, please respond in with "I don't know." 

        \n\nReponse:`;
        // const prompt_prose_style = "Please respond in the written style of William Shakespeare.";
        console.log("\n\nprompt_system " + prompt_system);
        console.log("\n\nprompt_user " + prompt_user);

        const stream = await OpenAIEdgeStream(
            "https://api.openai.com/v1/chat/completions",
            {
              headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            method: "POST",
            body: JSON.stringify({
                model: "gpt-3.5-turbo-0613",
                messages: [
                    {
                    role: "system",
                    content: prompt_system,
                    },
                    {
                    role: "user",
                    content: prompt_user,
                    },
                ],
                stream: true,
                presence_penalty: 0,
                top_p: 0.7,
                temperature: 0.2,
            }),
            }
        );

        return new Response(stream);
    } catch (error) {
        return new Response(
            {
                message: "An error occurred in api/openai_stream"
            },
            {
                status: 500
            },
        );
    }
}