import supabaseClient from "@/lib/supabaseClient";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export default async function handle(req, res) {
  const { method, body } = req;
  const { query, user_id } = body;

  console.log("Request body:", req.body); // Log the incoming request body

  if (req.method === "OPTIONS") {
    console.log("req.method ", req.method);
    return new Response("ok", { headers: corsHeaders });
  }

  const input = query.replace(/\n/g, " ");

  const embeddingResponse = await fetch(
    "https://api.openai.com/v1/embeddings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        model: "text-embedding-ada-002",
      }),
    },
  );

  const embeddingData = await embeddingResponse.json();
  const [{ embedding }] = embeddingData.data;
  console.log(embedding); // Log the embedding

  // Extract dates from the query
  const nlpResponse = await fetch(
    "https://willdzierson-nlp-to-dates.hf.space/run/predict",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [query] }),
    },
  );

  const nlpData = await nlpResponse.json();
  console.log(nlpData);
  const [
    {
      dates: [start_date = null, end_date = null],
    },
  ] = nlpData.data;

  if (method === "POST") {
    const { data, error } = await supabaseClient.rpc("search_notes_with_date", {
      query_embedding: embedding,
      input_user_id: user_id,
      similarity_threshold: 0.1,
      match_count: 10, // Adjust this value based on your desired result count
      start_date, // Add the start_date and end_date
      end_date,
    });

    if (error) {
      console.error("vector_search Error: ", error);
    }

    console.log("vector_search Data: ", data);
    //console.log("vector_search Error: ", error);

    return res.status(200).json({ data });
  } else {
    return res.status(405).end(); // Method Not Allowed
  }
}
