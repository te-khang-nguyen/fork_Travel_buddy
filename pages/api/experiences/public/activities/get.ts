import { supabase } from "@/libs/supabase/supabase_client";
import { NextApiRequest, NextApiResponse } from "next";
import activitiesTranslation from "./translation";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const experience_id = req.query["experience-id"];
    const language = req.query["language"];

    console.log("Experience ID: ", experience_id);
    console.log("Language: ", language);
    
    try {
        const { 
            data: queryData, 
            error 
        } = await supabase
            .from("activities")
            .select("*")
            .eq("experience_id", experience_id)
            .neq("status", "deleted")
            .order("order_of_appearance", { ascending: true })
            .order("created_at", { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if(language && (language !== "en" || !language.includes("en"))) {
            console.log("Not English but ", language);

            const { data: translatedData } = await supabase
                .from("experiences_activities_localizations")
                .select("*")
                .eq("experience_id", experience_id)
                .eq("language", language)
                .in("activity_id", queryData.map((activity) => activity.id))
                .order("created_at", { ascending: true });

            if (!translatedData || translatedData.length === 0) {
              console.log("Translation not found");

              const translatedActivities = await Promise.all(
                  queryData.map(async (activity) => {
                      return activitiesTranslation(
                        {
                          name: activity.title,
                          description: activity.description,
                          thumbnail_description: activity.description_thumbnail,
                          address: activity.address,
                          highlights: activity.highlights,
                        },
                        language as string
                      );
                  })
              );

              // console.log("Translation: \n", translatedActivities[0]);
              

              const { data: translationUpload, error: translationUploadError } = await supabase
                  .from("experiences_activities_localizations")
                  .insert(translatedActivities.map((activity, index) => {
                    return {
                      experience_id: experience_id,
                      language: language as string || "en",
                      activity_id: queryData[index].id,
                      ...activity
                    }
                  }))
                  .select("*")

              if (translationUploadError || !translationUpload) {
                console.log("Translation upload failed: \n", translationUploadError);
                return res.status(400).json({ error: "Translation upload failed"});
              }

              const reversedMapTranslation = translatedActivities.map((activity) => {
                return {
                  title: activity.name,
                  description: activity.description,
                  description_thumbnail: activity.thumbnail_description,
                  address: activity.address,
                  highlights: activity.highlights,
                }
              })

              // console.log("Translation uploaded successfully reverse mapping: \n", reversedMapTranslation[0]);

              const updatedData = queryData.map((activity, index) => {
                return {
                  ...activity,
                  ...reversedMapTranslation[index],
                }
              })

              // console.log("Translation uploaded successfully: \n", updatedData[0]);

              return res.status(200).json({ data: updatedData });
            }

            const updatedData = queryData.map((activity) => {
              const matchedTranslation = translatedData.find((translation) => translation.activity_id === activity.id);
              return {
                ...activity,
                title: matchedTranslation?.name,
                description: matchedTranslation?.description,
                description_thumbnail: matchedTranslation?.thumbnail_description,
                address: matchedTranslation?.address,
                highlights: matchedTranslation?.highlights,
              }
            })

            // console.log("Translation uploaded successfully: \n", updatedData[0]);

            return res.status(200).json({ data: updatedData });
        }

        return res.status(200).json({ data: queryData });
    } catch (err: any) {
        return res.status(500).json({ 
            error: err.message || 
            "An error has occurred while retrieving the challenge information."
        });
    }

};

// Workaround to enable Swagger on production 
export const swaggerPublicActivitiesGet = {
    index:16, 
    text:
`"/api/v1/experiences/public/activities": {
      "get": {
        "tags": ["experience"],
        "summary": "Get activities by experience ID for a non-authenticated user",
        "description": "Retrieve activities by experience ID for a non-authenticated user.",
        "parameters": [
          {
            "in": "query",
            "name": "experience-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the experience to retrieve activities for"
          }
        ],
        "responses": {
          "200": {
            "description": "Activities retrieved successfully",
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
                          "id": { "type": "string" },
                          "experience_id": { "type": "string" },
                          "title": { "type": "string" },
                          "primary_photo": { "type": "string" },
                          "photos": {
                            "type": "array",
                            "items": { "type": "string" }
                          },
                          "hours": { "type": "string" },
                          "status": { "type": "string" },
                          "attraction_info": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "description": { "type": "string" },
                                "description_thumbnail": { "type": "string" }
                              }
                            }
                          },
                          "description": { "type": "string" },
                          "description_thumbnail": { "type": "string" },
                          "url_slug": { "type": "string" },
                          "primary_keyword": { "type": "string" },
                          "address": { "type": "string" },
                          "order_of_appearance": { "type": "number" },
                          "primary_photo_id": { "type": "string" }
                        }
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