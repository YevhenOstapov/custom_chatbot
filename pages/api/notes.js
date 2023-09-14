import supabaseClient from "@/lib/supabaseClient";

export default async function handler(req, res) {
  const { user_id, page_size, page, search_term } = req.query;

  const PAGE_SIZE = page_size || 10;

  try {
    let data, error;

    if (search_term) {
      ({ data, error } = await supabaseClient
        .from("notes")
        .select(`*`)
        .ilike("content", `%${search_term}%`)
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1));
    } else {
      ({ data, error } = await supabaseClient
        .from("notes")
        .select(`*`)
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1));
    }

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
