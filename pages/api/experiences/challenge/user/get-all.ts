import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/challenge/user:
 *   get:
 *     tags:
 *       - challenge/user
 *     summary: Retrieve a challenge by ID
 *     description: Retrieve a challenge by its ID. If no ID is provided, it retrieves challenges with price 0.
 *     responses:
 *       200:
 *         description: A list of challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                      id:
 *                          type: string
 *                      businessId:
 *                          type: string
 *                      description:
 *                          type: string
 *                      thumbnailUrl:
 *                          type: string
 *                      backgroundUrl:
 *                          type: string
 *                      created:
 *                          type: string
 *                      title:
 *                          type: string
 *                      tourSchedule:
 *                          type: string
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token!);

    try {
        const { data, error } = await supabase
            .from("challenges")
            .select("*")
            .eq("status", "ACTIVE");

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}

// Workaround to enable Swagger on production 
export const swaggerUserChallengeGetAll = {
  index:42, 
  text:
    `"/api/v1/challenge/user ": {
      "get": {
        "tags": ["challenge/user (mock interface)"],
        "summary": "Retrieve all pusblished challenges",
        "description": "Retrieve all challenges with the status ACTIVE.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "A list of challenges",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "business_id": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          },
                          "reward_description": {
                            "type": "string"
                          },
                          "max_rewards": {
                            "type": "string"
                          },
                          "media_assets": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "url": { "type": "string" }
                              }
                            }
                          },
                          "start_date": {
                            "type": "string"
                          },
                          "end_date": {
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