import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

/**
 * @swagger
 * /api/v1/challenge/business:
 *   put:
 *     tags:
 *       - challenge/business
 *     summary: Update a challenge
 *     description: Update the details of an existing challenge.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challenge_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the challenge to update
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
 *               description:
 *                 type: string
 *                 description: Detailed description of the challenge
 *               thumbnailUrl:
 *                 type: string
 *                 description: URL of the challenge thumbnail image
 *               backgroundUrl:
 *                 type: string
 *                 description: URL of the challenge background image
 *               tourSchedule:
 *                 type: string
 *                 description: Schedule or timing of the tour
 *     responses:
 *       200:
 *         description: Challenge updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
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
    if (req.method !== 'PUT') {
        res.status(405).send({ message: 'Only PUT requests allowed' });
        return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const { challenge_id } = req.query;
    const data = req.body;

    if (!challenge_id) {
        return res.status(400).json({ error: "Challenge ID is required" });
    }

    try {
        const {
            data: updateData, 
            error: updateError
        } = await supabase.from('challenges')
                    .update({
                        ...data 
                    })
                    .eq('id', challenge_id)
                    .select("id");

        if (updateError) {
            return res.status(400).json({ error: updateError });
        }
        if (!updateData || updateData.length === 0) {
          return res.status(403).json({ success: false, message: "Unauthorized or challenge not found" });
        }
        return res.status(200).json({ success: true, message: "Challenge updated successfully", data: updateData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}


export const swaggerBussUpdate = {
  index:14, 
  text:
    `"/api/v1/challenge/business  ": {
      "put": {
        "tags": ["challenge/business"],
        "summary": "Update a challenge",
        "description": "Update the details of an existing challenge.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "path",
            "name": "challenge_id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the challenge to update"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "Title of the challenge"
                  },
                  "description": {
                    "type": "string",
                    "description": "Detailed description of the challenge"
                  },
                  "thumbnailUrl": {
                    "type": "string",
                    "description": "URL of the challenge thumbnail image"
                  },
                  "backgroundUrl": {
                    "type": "string",
                    "description": "URL of the challenge background image"
                  },
                  "tourSchedule": {
                    "type": "string",
                    "description": "Schedule or timing of the tour"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Challenge updated successfully",
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