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

    const { experience_id, company_id, email, language } = req.body;

    const { data: visitorData } = await supabase
      .from("visitors")
      .select('*')
      .eq("email", email)
      .eq("experience_id", experience_id)
      .single();

    if (!visitorData) {
      if (!company_id && !experience_id) {
        const { data, error } = await supabase
        .from("visitors")
        .insert({
          email,
          language,
        })
        .select("*")
        .single();

        if (error) {
          return res.status(400).json({
            error: error.message
          });
        }

        return res.status(200).json({
          data: {
            visitor_id: data.id,
            language: data.language,
          }
        });
      }

      if (company_id) {
        const { data, error } = await supabase
        .from("visitors")
        .insert({
          email,
          language,
          company_id,
        })
        .select("*")
        .single();

        if (error) {
          return res.status(400).json({
            error: error.message
          });
        }

        return res.status(200).json({
          data: {
            visitor_id: data.id,
            experience_id: data.experience_id,
            language: data.language,
            company_id: data.company_id,
          }
        });
      }

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
          data: {
            visitor_id: data.id,
            experience_id: data.experience_id,
            language: data.language,
            company_id: data.company_id,
          }
        });
    }

    return res.status(200).json({
      data: {
        visitor_id: visitorData.id,
        experience_id: visitorData.experience_id,
        language: visitorData.language,
        company_id: visitorData.company_id,
      }
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