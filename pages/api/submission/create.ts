import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import {
    base64toBinary,
} from "@/libs/services/utils";
import crypto from "crypto";

/**
 * @swagger
 * /api/v1/submission/upload-user-submission:
 *   post:
 *     tags:
 *       - submission
 *     summary: Upload user submission
 *     description: Upload a user's submission for a challenge.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeId:
 *                 type: string
 *                 description: The ID of the challenge
 *               userLocationSubmission:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                       locationId:
 *                         type: string
 *                       userQuestionSubmission:
 *                         type: string
 *                       userMediaSubmission:
 *                         type: array
 *                         items:
 *                            type: string
 *     responses:
 *       200:
 *         description: Submission uploaded successfully
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
 *                       userId:
 *                         type: string
 *                       userChallengeSubmission:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             index:
 *                               type: number
 *                             locationId:
 *                               type: string
 *                             userQuestionSubmission:
 *                               type: string
 *                             userMediaSubmission:
 *                               type: array
 *                               items:
 *                                 type: string
 *                       created:
 *                         type: string 
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

export const imageToStorage = async (inputobj, supabase) => {
    const hash = crypto.randomBytes(16).toString("hex");
    const fileName = `${inputobj.title.replace(/\s+/g, "")}_${hash}.jpg`;
    const storageRef = `${inputobj.userId}/${inputobj.title}/${fileName}`;
  
    const uploadTask = await supabase.storage
      .from(inputobj.bucket)
      .upload(storageRef, inputobj.data, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/jpg",
      });
  
    if (uploadTask.error) {
      return { error: uploadTask.error };
    }
    const { data, error } = await supabase.storage
      .from(inputobj.bucket)
      .createSignedUrl(uploadTask.data.path, 60 * 60 * 24 * 365);
  
    return { data: data?.signedUrl };
  };

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

    const challengeId = req.query?.challenge_id;
    const { userLocationSubmission } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
        const { data: existingData } =
            await await supabase
                .from("challengeHistories")
                .select()
                .eq("challengeId", challengeId)
                .eq("userId", user!.id)
                .single();

        const oldSubmissions = existingData?.userChallengeSubmission || [];

        const newSubmission = {
            userQuestionSubmission: userLocationSubmission?.userQuestionSubmission,
            userMediaSubmission: []
        };

        const cleanMergeSubmission = [
            newSubmission,
            ...oldSubmissions.filter(
                () =>
                    !userLocationSubmission.some(
                        (newItem) => newItem.locationId === undefined
                    )
            ),
        ];


        const insertCleanData = {
            challengeId: challengeId,
            userId: user!.id,
            userChallengeSubmission: cleanMergeSubmission,

            ...(existingData ? { id: existingData.id } : {}),
        };

        const { data, error } = await supabase
              .from("challengeHistories")
              .upsert(insertCleanData)
              .select()
              .single();

        const mergedSubmissions = [
            ...userLocationSubmission,
            ...oldSubmissions.filter(
                () =>
                    !userLocationSubmission.some(
                        (newItem) => newItem.locationId === undefined
                    )
            ),
        ];

        const insertData = {
            id: data?.id,
            challengeId: challengeId,
            userId: user!.id,
            userChallengeSubmission: mergedSubmissions,
        };

        const { data: updateData, error: updateError } = await supabase
              .from("challengeHistories")
              .upsert(insertData)
              .select()
              .single();

        if (updateError) {
            return res.status(400).json({ error: updateError });
        } else {
            return res.status(200).json({ data: updateData });
        }

    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred when trying to write submission data to database." });
    }

};

export const swaggerSubmissionCreate = {
  index:22, 
  text:
`"/api/v1/submission": {
    "post": {
      "tags": ["submission"],
      "summary": "Upload user submission",
      "description": "Upload a user's submission for a challenge.",
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
                "challengeId": {
                  "type": "string",
                  "description": "The ID of the challenge"
                },
                "userLocationSubmission": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "locationId": {
                        "type": "string"
                      },
                      "userQuestionSubmission": {
                        "type": "string"
                      },
                      "userMediaSubmission": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
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
          "description": "Submission uploaded successfully",
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
                      "userId": {
                        "type": "string"
                      },
                      "userChallengeSubmission": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "index": {
                              "type": "number"
                            },
                            "locationId": {
                              "type": "string"
                            },
                            "userQuestionSubmission": {
                              "type": "string"
                            },
                            "userMediaSubmission": {
                              "type": "array",
                              "items": {
                                "type": "string"
                              }
                            }
                          }
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