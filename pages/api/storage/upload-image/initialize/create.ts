import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = req.headers.authorization?.split(' ')[1];
  const supabase = createApiClient(token);

  const { fileName, totalParts } = req.body;

  try {
    // Create upload session in database
    const { data, error } = await supabase
      .from('uploads')
      .insert([{
        file_name: fileName,
        total_parts: totalParts,
        received_parts: [],
        status: 'initialized'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ uploadId: data.id });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}