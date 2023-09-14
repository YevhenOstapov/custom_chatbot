import storeEmbedding from '@/lib/storeEmbedding'

export default async function handle(req, res) {
  const { method, body } = req;

  if (method === "POST") {
    const { user_id, content, metadata } = body;
    await storeEmbedding(user_id, content, metadata, null);
    return res.status(200).json({ success: true });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
}
