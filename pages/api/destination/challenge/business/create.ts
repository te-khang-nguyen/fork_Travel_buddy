import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

/**
 * @swagger
 * /api/v1/challenge/business:
 *   post:
 *     tags:
 *      - challenge/business
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier of the created challenge
 *                       example: "chg_123456"
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
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        const supabase = createApiClient(token);

        const {
            data: { user },
        } = await supabase.auth.getUser(token);

        const { 
            title, 
            description, 
            thumbnailUrl, 
            backgroundUrl, 
            tourSchedule 
        } = req.body;

        const userId = user?.id;

        const { data, error } = await supabase
        .from("challenges")
        .insert([
            {
                title,
                businessid: userId,
                description,
                thumbnailUrl,
                backgroundUrl,
                tourSchedule,
                status: "PASSIVE",
            },
        ])
        .select("id")
        .single();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(200).json({
            data: { id: data.id },
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

// Workaround to enable Swagger on production 
export const swaggerBussChallengeCreate = {
  index:44, 
  text:
`"/api/v1/challenge/business/ ": {
    "post": {
      "tags": ["challenge/business (mock interface)"],
      "summary": "Create a New Challenge",
      "description": "Allows a business user to create a new travel challenge",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "Name of the challenge",
                  "example": "Mountain Hiking Adventure"
                },
                "description": {
                  "type": "string",
                  "description": "Detailed description of the challenge",
                  "example": "Explore breathtaking mountain trails and scenic landscapes"
                },
                "reward_description": {
                  "type": "string"
                },
                "max_rewards": {
                  "type": "string"
                },
                "media": {
                  "type": "string",
                  "description": "URL of the challenge thumbnail image",
                  "example": "https://example.com/mountain-challenge-thumb.jpg"
                },
                "created_at": {
                  "type": "string"
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
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "Unique identifier of the created challenge"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request or validation error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": { "type": "string" }
                }
              }
            }
          }
        },
        "401": {
          "description": "Unauthorized - Invalid or missing authentication token",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "message": { "type": "string" }
                }
              }
            }
          }
        },
        "500": {
          "description": "Internal server error",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "error": { "type": "string" }
                }
              }
            }
          }
        }
      }
    }
  }`
}