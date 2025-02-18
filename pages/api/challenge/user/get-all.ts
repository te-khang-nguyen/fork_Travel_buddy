import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /api/challenge/user:
 *   post:
 *     tags:
 *       - challenge/user
 *     summary: Create a New Challenge
 *     description: Allows a business user to create a new travel challenge
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

export const swaggerUserGetAll = 
    `"/api/v1/challenge/user ": {
      "post": {
        "tags": ["challenge/user"],
        "summary": "Create a New Challenge",
        "description": "Allows a business user to create a new travel challenge",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "Title of the challenge",
                    "example": "Mountain Hiking Adventure"
                  },
                  "description": {
                    "type": "string",
                    "description": "Detailed description of the challenge",
                    "example": "Explore breathtaking mountain trails and scenic landscapes"
                  },
                  "thumbnailUrl": {
                    "type": "string",
                    "description": "URL of the challenge thumbnail image",
                    "example": "https://example.com/mountain-challenge-thumb.jpg"
                  },
                  "backgroundUrl": {
                    "type": "string",
                    "description": "URL of the challenge background image",
                    "example": "https://example.com/mountain-challenge-bg.jpg"
                  },
                  "tourSchedule": {
                    "type": "string",
                    "description": "Schedule or timing of the tour",
                    "example": "Weekends, 8 AM - 5 PM"
                  }
                }
              }
            }
          }
        },
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
                          "businessId": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          },
                          "thumbnailUrl": {
                            "type": "string"
                          },
                          "backgroundUrl": {
                            "type": "string"
                          },
                          "created": {
                            "type": "string"
                          },
                          "title": {
                            "type": "string"
                          },
                          "tourSchedule": {
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