import { createApiClient } from "@/libs/supabase/supabaseApi";
import { User } from "@supabase/supabase-js";
import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from "next";
import { memberCreationEmailTemplate } from "./email-template";
import mailSendHandler from "./send-email";
import { superAdminCreationEmailTemplate } from "./super-admin_email";

export function generateRandomPassword(length: number): string {
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

  const { companyId, members, redirect_link, role } = req.body;

  if (!companyId || !redirect_link || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!members || members.length === 0) {
    return res.status(400).json({ error: 'Missing members' });
  }

  const checkMembersWithoutEmail = members.filter((member) => !member.email);

  if (checkMembersWithoutEmail.length > 0) {
    return res.status(400).json({ error: 'Missing email for some members' });
  }

  try {
    const { data: companyData, error: companyError } = await supabase
      .from('company_accounts')
      .select('name')
      .eq('id', companyId)
      .single();

    if (companyError || !companyData) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const newMembers = Promise.all(members.map(async ({ email, name }) => {
      const redirectLinkHost = (new URL(redirect_link)).host;
      const { data: userData, error: userError } = await supabase
        .from('businessprofiles')
        .select('*')
        .eq('email', email)
        .single();

      const { data: userprofileData } = await supabase
        .from('userprofiles')
        .select('*')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        const password = generateRandomPassword(8);
        let userCredential: User | { id: string } | null = null;
        if (!userprofileData) {
          const { data: { user }, error } = await supabase.auth.signUp({ email, password });
          userCredential = user;
          if (error || !user) {
            return res.status(400).json({ error: error });
          }
        } else {
          userCredential = { id: userprofileData.userid };
        }

        const { data: newUser, error: newUserError } = await supabase
          .from('businessprofiles')
          .insert({
            businessid: userCredential?.id,
            email,
            businessname: `${role} of ${companyData.name}`,
            username: name,
            type: role == 'admin' && companyId == 'c7ae75f1-96f0-409d-b5e7-24ce7d304d5a' ? 'SUPER_ADMIN' : null,
          })
          .select('*')
          .single();

        if (newUserError || !newUser) {
          return res.status(400).json({ error: newUserError?.message });
        }

        if (companyId === 'c7ae75f1-96f0-409d-b5e7-24ce7d304d5a') {
          const emailBodyNewMember = superAdminCreationEmailTemplate({
            email,
            password: !userprofileData ? password : undefined,
            redirect_link,
            recovery_link: `https://${redirectLinkHost}/auth/forgot-password`,
          });

          const mailSendResp = await mailSendHandler({
            sender: 'hello@travelbuddy8.com',
            senderName: 'Travel Buddy 8',
            to: [email],
            bcc: ["trac.nguyen@edge8.ai"],
            subject: 'Welcome to Travel Buddy 8 Business Management Platform',
            html: emailBodyNewMember,
          });

          if (mailSendResp.error) {
            return res.status(500).json({ error: mailSendResp.error });
          }
        } else {
          const emailBodyNewMember = memberCreationEmailTemplate({
            companyName: companyData.name,
            email,
            password: !userprofileData ? password : undefined,
            redirect_link,
            recovery_link: `https://${redirectLinkHost}/auth/forgot-password`,
            role
          });

          const mailSendResp = await mailSendHandler({
            sender: 'hello@travelbuddy8.com',
            senderName: 'Travel Buddy 8',
            to: [email],
            bcc: ["trac.nguyen@edge8.ai"],
            subject: 'Welcome to Travel Buddy 8 Business Management Platform',
            html: emailBodyNewMember,
          });

          if (mailSendResp.error) {
            return res.status(500).json({ error: mailSendResp.error });
          }
        }


        return newUser.businessid;
      }

      const { data: companyMemberData } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', companyId)
        .eq('member_id', userData.businessid)
        .eq('role', role)

      if (companyMemberData && companyMemberData.length > 0) {
        return res.status(400).json({ error: `Member is already assigned as "${role}" for this client` });
      }

      const emailBodyReinvite = memberCreationEmailTemplate({
        companyName: companyData.name,
        email,
        redirect_link,
        recovery_link: `https://${redirectLinkHost}/auth/forgot-password`,
        role
      });

      const mailSendResp = await mailSendHandler({
        sender: 'hello@travelbuddy8.com',
        senderName: 'Travel Buddy 8',
        to: [email],
        bcc: ["trac.nguyen@edge8.ai"],
        subject: 'Welcome to Travel Buddy 8 Business Management Platform',
        html: emailBodyReinvite,
      });

      if (mailSendResp.error) {
        console.log(mailSendResp.error);
        return res.status(500).json({ error: mailSendResp.error });
      }

      return userData.businessid;
    }));

    const newMembersList = (await newMembers).filter((memberId) => memberId !== undefined)

    const { data, error } = await supabase
      .from('company_members')
      .insert(newMembersList.map((memberId) => ({
        company_id: companyId,
        member_id: memberId,
        role: role || 'member'
      })))
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      data: {
        message: 'Members created successfully',
        data: data
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}


// Workaround to enable Swagger on production
export const swaggerBussExpCreateEditor = {
  index: 13,
  text: `"/api/v1/companies/members/": {
      "post": {
        "tags": ["B2B-experience-client-member"],
        "summary": "Create a new member for a company",
        "description": "Add a new member to a company account.",
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
                    "description": "The ID of the company to which the member will be added"
                  },
                  "emails": {
                    "type": "array",
                    "items": { "type": "string" },
                    "description": "The emails of the members to be added"
                  }
                },
                "required": ["companyId", "emails"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Member created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object"
                        "properties": {
                          "id": { "type": "string" },
                          "member_id": { "type": "string" },
                          "role": { "type": "string" },
                          "created_at": { "type": "string" },
                          "updated_at": { "type": "string" },
                          "company_id": { "type": "string" },
                          "is_deleted": { "type": "boolean" }
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

