import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";

/**
 * @swagger
 * /api/v1/challenge/business:
 *   delete:
 *     tags:
 *       - challenge/business
 *     summary: Delete a challenge
 *     description: Move a challenge into "Archived" and will be deleted
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challenge_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the challenge to update
 *     responses:
 *       200:
 *         description: Challenge deleted successfully
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
 *                      status:
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
    if (req.method !== 'DELETE') {
        res.status(405).send({ message: 'Only DELETE requests allowed' });
        return;
    }

    const { challenge_id } = req.query;
    // Extract authorization token
    const token = req.headers.authorization?.split(" ")[1];
    // Create Supabase client
    const supabase = createApiClient(token);

    if (!challenge_id) {
        return res.status(400).json({ error: "Challenge ID is required" });
    }

    try {
        const { data, error } = await supabase
            .from("challenges")
            .update({status : "ARCHIVED"})
            .eq("id", challenge_id)
            .select("id, status");

        if (error) {
            return res.status(400).json({ error });
        }

        return res.status(200).json({ data });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || "An error occurred while updating the challenge" 
        });
    }
}


// Workaround to enable Swagger on production 
export const swaggerBussChallengeDel = {
  index:47, 
  text:
    `"/api/v1/challenge/business": {
      "delete": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Delete a challenge",
        "description": "Move a challenge into 'Archived' and will be deleted",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "challenge-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the challenge to update"
          }
        ],
        "responses": {
          "200": {
            "description": "Challenge deleted successfully",
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