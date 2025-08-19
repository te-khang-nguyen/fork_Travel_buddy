import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";
import { TranslationServiceClient } from '@google-cloud/translate';

// Initialize Google Translation Client
const translationClient = new TranslationServiceClient({
  credentials: {
    client_email: process.env.GCP_PROJECT_CLIENT_EMAIL,
    private_key: process.env.GCP_PROJECT_PRIVATE_KEY,
  },
});

const targetKeys = ["name", "description", "thumbnail_description", "address"];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.status(405).send({ message: 'Only GET requests allowed' })
        return
    }

    const {"experience-id": experience_id, "language": language} = req.query;

    try {
        const { data, error } = await supabase
            .from("experiences")
            .select("*,company_accounts(name),businessprofiles(username)")
            .eq("id", experience_id)
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (language && (language !== "en" || !language.includes("en"))) {
            // Check if the translation exists
            const { data: localizedData, error: localizedError } = await supabase
                .from("experiences_activities_localizations")
                .select("*")
                .eq("experience_id", experience_id)
                .eq("language", language)
                .is("activity_id", null)
                .single();
            
            console.log("Localized data: ", localizedData);

            if (localizedError || !localizedData) {
                console.log(localizedError);
                // If the translation doesn't exist, translate the data
                console.log("Localized data not found");

                const toBeTranslated = Object.entries(data).reduce((acc, [key, value]) => {
                    if (targetKeys.includes(key)) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});

                const projectId = process.env.GCP_PROJECT_CLIENT_ID?.split("-")[0];
                const [translationResponse] = await translationClient.translateText({
                    parent: `projects/${projectId}/locations/us-central1`,
                    targetLanguageCode: language as string   || "en",
                    contents: Object.values(toBeTranslated)
                });


                if (!translationResponse) {
                    return res.status(400).json({ error: "Translation failed" });
                }

                const [followUpQuestionsTranslation] = await translationClient.translateText({
                  parent: `projects/${projectId}/locations/us-central1`,
                  targetLanguageCode: language as string   || "en",
                  contents: data.default_questions
                });

                if (!followUpQuestionsTranslation) {
                  console.log("Follow up questions translation failed");
                  return res.status(400).json({ error: "Translation failed" });
                }

                const defaultQuestionsTranslation = followUpQuestionsTranslation
                ?.translations
                ?.map((translation) => translation?.translatedText || "").filter((translation) => translation !== "");

                const translations = translationResponse?.translations?.map((translation, index) => {
                    return [
                        Object.keys(toBeTranslated)[index],
                        translation?.translatedText || ""
                    ]
                })

                const translationsObject = Object.fromEntries(translations || []);

                if (!translations) {
                    return res.status(400).json({ error: "Translation failed" });
                }

                const { data: translationUpload, error: translationUploadError } = await supabase
                    .from("experiences_activities_localizations")
                    .insert({
                      experience_id: experience_id,
                      language: language as string || "en",
                      default_questions: defaultQuestionsTranslation,
                      ...translationsObject
                    })
                    .select("*")
                    .single();

                if (translationUploadError) {
                  console.log("Translation upload failed: \n", translationUploadError);
                  return res.status(400).json({ error: "Translation upload failed"});
                }

                const updatedData = Object.entries(data).reduce((acc, [key, value]) => {
                    if (translations?.find((translation) => translation[0] === key)) {
                        acc[key] = translations?.find((translation) => translation[0] === key)?.[1];
                    } else {
                        acc[key] = value;
                    }
                    return acc;
                }, {});

                const { company_accounts, businessprofiles, ...rest } = updatedData as any;
                return res.status(200).json({ 
                  data:{
                    ...rest, 
                    default_questions: defaultQuestionsTranslation,
                    owner: company_accounts?.name, 
                    created_by: businessprofiles?.username 
                  }
                });
            } else {
              const updatedData = Object.entries(data).reduce((acc, [key, value]) => {
                if (Object.keys(localizedData).find((localizedKey) => localizedKey === key)) {
                  acc[key] = localizedData?.[key];
                } else {
                  acc[key] = value;
                }
                return acc;
              }, {});

              const { company_accounts, businessprofiles, ...rest } = updatedData as any;
              return res.status(200).json({ 
                data:{
                  ...rest, 
                  owner: company_accounts?.name, 
                  created_by: businessprofiles?.username 
                }
              });
            }
        }

        const { company_accounts, businessprofiles, ...rest } = data;
        return res.status(200).json({ 
          data:{
            ...rest, 
            owner: company_accounts?.name, 
            created_by: businessprofiles?.username 
          }
        });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "An error has occurred while retrieving the challenge information."});
    }
}

// Workaround to enable Swagger on production 
export const swaggerPublicExpGet = {
    index:13, 
    text:
  `"/api/v1/experiences/public": {
      "get": {
        "tags": ["experience"],
        "summary": "Get a destination by ID for a non-authenticated user",
        "description": "Retrieve a destination by its ID for a non-authenticated user.",
        "parameters": [
          {
            "in": "query",
            "name": "experience-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the destination to retrieve"
          }
        ],
        "responses": {
          "200": {
            "description": "Destination retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "created_by": { "type": "string" },
                        "name": { "type": "string" },
                        "primary_photo": { "type": "string" },
                        "photos": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
                        "address": { "type": "string" },
                        "status": { "type": "string" },
                        "created_at": { "type": "string" },
                        "updated_at": { "type": "string" },
                        "primary_keyword": { "type": "string" },
                        "url_slug": { "type": "string" },
                        "description": { "type": "string" },
                        "thumbnail_description": { "type": "string" },
                        "primary_video": { "type": "string" },
                        "parent_destination": { "type": "string" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
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
          "405": {
            "description": "Method not allowed",
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