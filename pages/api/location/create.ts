import { NextApiRequest, NextApiResponse } from "next";
import { imageToStorage } from "../submission/create";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import {
    base64toBinary,
} from "@/libs/services/utils";

/**
 * @swagger
 * /api/v1/location/create:
 *   post:
 *     tags:
 *       - location
 *     summary: Create location
 *     description: Create a new location for a challenge.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: challengeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The name of the location
 *               backgroundImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The background image of the location
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: The title of the section
 *                     instruction:
 *                       type: string
 *                       description: The instruction of the section
 *                     media:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: The media of the section
 *     responses:
 *       200:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                       id:
 *                         type: string
 *                       challengeId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       location_info:
 *                         type: array
 *                         items:
 *                          type: object
 *                          properties:
 *                           title:
 *                             type: string
 *                           instruction:
 *                             type: string
 *                           media:
 *                             type: array
 *                             items:
 *                               type: string
 *                       imageUrls:
 *                         type: array
 *                         items:
 *                           type: string
 *                       created:
 *                         type: string 
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

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
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { challengeId } = req.query;
    const { title, backgroundImages, sections } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const { data, error } = await supabase.from("locations").insert([
            {
                challengeid: challengeId,
                status: "ACTIVE",
                title,
                imageurls: [
                    backgroundImages
                        ? (await imageToStorage({
                            userId: user!.id,
                            bucket: "challenge",
                            title: `${challengeId}loc=${title}`,
                            location: `bgFor${title}`,
                            data: typeof backgroundImages[0] === 'string'?
                                base64toBinary(backgroundImages[0])
                                :backgroundImages[0],
                        }, supabase))?.data
                        : null,
                ],
                location_info: await Promise.all(
                    sections.map(async (section) => ({
                        title: section.title,
                        instruction: section.instruction,
                        media: section.media
                            ? await Promise.all(
                                section.media.map(async (item, indexA) =>
                                    (await imageToStorage({
                                        userId: user!.id,
                                        bucket: "challenge",
                                        title: `${section.title}id=${indexA}`,
                                        data: typeof item === 'string'?
                                            base64toBinary(item)
                                            :item
                                    }, supabase))?.data
                                )) : null,
                    }))
                ),
            },
        ]).select('id');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ data: data });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while creating a new location." });
    }
};

export const swaggerLocCreate = {
  index:17, 
  text:
`"/api/v1/location": {
    "post": {
      "tags": ["location"],
      "summary": "Create location",
      "description": "Create a new location for a challenge.",
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "parameters": [
        {
          "in": "query",
          "name": "challengeId",
          "schema": {
            "type": "string"
          },
          "required": true,
          "description": "The ID of the challenge"
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
                  "description": "The name of the location"
                },
                "backgroundImages": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "The background image of the location"
                },
                "sections": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "title": {
                        "type": "string",
                        "description": "The title of the section"
                      },
                      "instruction": {
                        "type": "string",
                        "description": "The instruction of the section"
                      },
                      "media": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "description": "The media of the section"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Location created successfully",
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
                      "challengeId": {
                        "type": "string"
                      },
                      "title": {
                        "type": "string"
                      },
                      "location_info": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "title": {
                              "type": "string"
                            },
                            "instruction": {
                              "type": "string"
                            },
                            "media": {
                              "type": "array",
                              "items": {
                                "type": "string"
                              }
                            }
                          }
                        }
                      },
                      "imageUrls": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "created": {
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