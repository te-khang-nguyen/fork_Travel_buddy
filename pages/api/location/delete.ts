import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
        },
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const locationId = req.query?.location_id;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser();

    try {
        const {
            data: locationData,
            error: locationErr
        } = await supabase
            .from('locations')
            .upsert({ id: locationId, status: "ARCHIVED" })
            .select()
            .single();

        if (locationErr) {
            return res.status(400).json({ error: locationErr.message });
        }

        return res.status(200).json({ data: locationData });

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while updating location." });
    }

};

export const swaggerLocDel = {
  index:21, 
  text:
`"/api/v1/location     ": {
    "put": {
      "tags": ["location"],
      "summary": "Delete location",
      "description": "Move a location into 'Archived' status.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "location_id",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the location to update"
        }
      ],
      "responses": {
        "200": {
          "description": "Location deleted successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "status": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request"
        },
        "405": {
          "description": "Method not allowed"
        },
        "500": {
          "description": "Internal server error"
        }
      }
    }
  }`
}