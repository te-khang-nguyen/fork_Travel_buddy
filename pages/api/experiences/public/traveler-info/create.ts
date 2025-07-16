import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/libs/supabase/supabase_client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  try {

    const { experience_id, email, language } = req.body;

    const { data: visitorData } = await supabase
      .from("visitors")
      .select('*')
      .eq("email", email)
      .eq("experience_id", experience_id)
      .single();

    if (!visitorData) {
      const { data: expData } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", experience_id)
        .single();
      
      const { data, error } = await supabase
        .from("visitors")
        .insert({
          experience_id,
          email,
          language,
          company_id: expData.owned_by,
        })
        .select("*")
        .single();

        if (error) {
          return res.status(400).json({
            error: error.message
          });
        }
  
        return res.status(200).json({
          data: data
        });
    }

    return res.status(200).json({
      data: visitorData
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Workaround to enable Swagger on production 
export const swaggerExpTravelerInfoCreate = {
  index: 17,
  text:
    ``
}