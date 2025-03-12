import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

/**
 * @swagger
 * /api/v1/challenge/business:
 *   post:
 *     tags:
 *       - challenge/business
 *     summary: Create a New Challenge
 *     description: Allows a business user to create a new travel challenge
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the challenge
 *                 example: "Mountain Hiking Adventure"
 *               description:
 *                 type: string
 *                 description: Detailed description of the challenge
 *                 example: "Explore breathtaking mountain trails and scenic landscapes"
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL of the challenge thumbnail image
 *                 example: "https://example.com/mountain-challenge-thumb.jpg"
 *               backgroundUrl:
 *                 type: string
 *                 description: URL of the challenge background image
 *                 example: "https://example.com/mountain-challenge-bg.jpg"
 *               tourSchedule:
 *                 type: string
 *                 description: Schedule or timing of the tour
 *                 example: "Weekends, 8 AM - 5 PM"
 *     responses:
 *       200:
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                    type: object   
 *                    properties:
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
 *         description: Bad request or validation error
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
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

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);
    
    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const { data, error } = await supabase
            .from("challenges")
            .select("*");
            // .eq('businessid', user!.id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}


// Workaround to enable Swagger on production 
export const swaggerBussChallengeGetAll = {
  index:45, 
  text:
    `"/api/v1/challenge/business/  ": {
      "get": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Create a New Challenge",
        "description": "Allows a business user to create a new travel challenge",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Challenge created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
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
            "description": "Bad request or validation error"
          },
          "401": {
            "description": "Unauthorized - Invalid or missing authentication token"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    }`
}