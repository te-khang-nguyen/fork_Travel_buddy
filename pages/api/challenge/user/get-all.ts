import { supabase } from "@/libs/supabase/supabase_client";
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
    `"/api/v1/challenge/user": {
      "get": {
        "tags": ["challenge/user"],
        "summary": "Retrieve a challenge by ID",
        "description": "Retrieve all challenges with status as ACTIVE.",
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