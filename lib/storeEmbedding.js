import { Configuration, OpenAIApi } from "openai";
import supabaseClient from "@/lib/supabaseClient";

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openAi = new OpenAIApi(configuration);

export default async function storeEmbedding(user_id, content, metadata, url) {
  try {
    const input = content.replace(/\n/g, " ");
    const embeddingResponse = await openAi.createEmbedding({
      model: "text-embedding-ada-002",
      input,
    });

    const [{ embedding }] = embeddingResponse.data.data;
    console.log("embedding", embedding);

    const { data: note, error: noteError } = await supabaseClient
      .from("notes")
      .insert({
        content,
        url,
        user_id,
        metadata,
      })
      .select("*");

    if (noteError) {
      console.error("Error inserting note: ", noteError.message);
      throw new Error(noteError.message);
    }

    if (!note || note.length === 0) {
      console.error("No data returned from note insert operation");
      throw new Error("No data returned from note insert operation");
    }

    // Insert the embedding into the 'embeddings' table
    const { error: embeddingError } = await supabaseClient
      .from("embeddings")
      .insert({
        note_id: note[0].id,
        embedding,
      });

    if (embeddingError) {
      throw new Error(embeddingError.message);
    }
  } catch (error) {
    console.error("Error in storeEmbedding: ", error.message);
    return error.message;
  }
}
