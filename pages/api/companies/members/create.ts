import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { memberCreationEmailTemplate } from "./email-template";
import mailSendHandler from "./send-email";
import crypto from 'crypto';

const baseUrl = process.env.NODE_ENV === 'production' ? 
process.env.NEXT_PUBLIC_BASE_URL
: 'http://localhost:3000';

function generateRandomPassword(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let password = "";
  const randomValues = new Uint32Array(length); // Use Uint8Array for smaller values if preferred
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % characters.length;
    password += characters.charAt(randomIndex);
  }

  return password;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const { companyId, emails, redirect_link } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { data: companyData, error: companyError } = await supabase
            .from('company_accounts')
            .select('name')
            .eq('id', companyId)
            .single();

        if (companyError || !companyData) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const newMembers = Promise.all(emails.map(async (email: string) => {
            // Create a account for the new user if it doesn't exist with randomized password
            const redirectLinkHost = (new URL(redirect_link)).host;
            const { data: userData, error: userError } = await supabase
                .from('businessprofiles')
                .select('*')
                .eq('email', email)
                .single();
            
            const { data: userprofileData, error: userprofileError } = await supabase
                .from('userprofiles')
                .select('*')
                .eq('email', email)
                .single();
              
            if (userError || !userData || userprofileError || !userprofileData) {
              const password = generateRandomPassword(8);
              let userCredential: any;
              if(!userprofileData && !userData){
                const { data: { user } } = await supabase.auth.signUp({ email, password });
                userCredential = user;
                if (!user) {
                    return res.status(400).json({ error: 'User not found' });
                }
              } else if (userprofileData && !userData){
                userCredential = { id: userprofileData.userid };
              }
                
                const { data: newUser, error: newUserError } = await supabase
                    .from('businessprofiles')
                    .insert({
                        businessid: userCredential.id,
                        email,
                        businessname: `Member of ${companyData.name}`,
                    })
                    .select('*')
                    .single();

                if (newUserError || !newUser) {
                    return res.status(400).json({ error: newUserError?.message });
                }

                const emailBodyNewMember = memberCreationEmailTemplate({
                    companyName: companyData.name,
                    email,
                    password: !userprofileData ? password : undefined,
                    redirect_link,
                    recovery_link: `https://${redirectLinkHost}/auth/forgot-password`
                });

                const mailSendResp = await mailSendHandler({
                    sender: 'hello@travelbuddy8.com',
                    senderName: 'Travel Buddy 8',
                    to: [email],
                    bcc: ["trac.nguyen@edge8.ai"],
                    subject: 'Welcome to Travel Buddy 8 Trip report platform',
                    html: emailBodyNewMember,
                });

                if(mailSendResp.error){
                  console.log(mailSendResp.error);
                  return res.status(500).json({ error: mailSendResp.error });
                }
                
                return newUser.businessid;
            }

            const emailBodyReinvite = memberCreationEmailTemplate({
              companyName: companyData.name,
              email,
              redirect_link,
              recovery_link: `https://${redirectLinkHost}/auth/forgot-password`
            });

            const mailSendResp = await mailSendHandler({
              sender: 'hello@travelbuddy8.com',
              senderName: 'Travel Buddy 8',
              to: [email],
              bcc: ["trac.nguyen@edge8.ai"],
              subject: 'Welcome to Travel Buddy 8 Trip report platform',
              html: emailBodyReinvite,
            });

            if(mailSendResp.error){
              console.log(mailSendResp.error);
              return res.status(500).json({ error: mailSendResp.error });
            }

            return userData.businessid;
        }));
        
        const newMembersList = (await newMembers).filter((memberId) => memberId !== undefined);

        console.log(newMembersList);
        
        const { data, error } = await supabase
            .from('company_members')
            .insert(newMembersList.map((memberId) => ({
                company_id: companyId,
                member_id: memberId,
                role: 'member'
            })))
            .select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({ data: {
          message: 'Members created successfully',
          data: data
        } });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


//
// Workaround to enable Swagger on production
export const swaggerBussExpCreateEditor = {
    index: 13,
    text: `"/api/v1/companies/editors/create": {
      "post": {
        "tags": ["B2B-experience"],
        "summary": "Create a new editor for a company",
        "description": "Add a new editor to a company account.",
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
                  "companyId": {
                    "type": "string",
                    "description": "The ID of the company to which the editor will be added"
                  },
                  "editorEmail": {
                    "type": "string",
                    "description": "The email of the editor to be added"
                  }
                },
                "required": ["companyId", "editorEmail"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Editor created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "editors": {
                          "type": "array",
                          "items": { "type": "string" }
                        },
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
          "401": {
            "description": "Unauthorized",
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
          "404": {
            "description": "Company not found",
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
    }
}`,
}

