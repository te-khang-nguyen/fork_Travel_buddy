import { NextApiRequest, NextApiResponse } from "next";
import { supabase, supabase_admin } from "@/libs/supabase/supabase_client";
import { generateRandomPassword } from "@/pages/api/companies/members/create";
import mailSendHandler from "@/pages/api/companies/members/send-email";


const userCreationEmailTemplate = ({
  email,
  password,
  redirect_link,
  recovery_link
}: {
  companyName: string;
  email: string;
  password?: string;
  redirect_link: string;
  recovery_link: string;
}) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>You've Been Invited to Join</title>
  <style type="text/css">
      /* Basic Resets */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f4f4; }

      /* Responsive Styles */
      @media screen and (max-width: 600px) {
          .email-container {
              width: 100% !important;
              margin: auto !important;
          }
      }
  </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #f4f4f4;">
  
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
      You've been invited to Travel Buddy. Your login details are inside.
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
      <tr>
          <td align="center" valign="top">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" class="email-container">
                  <tr>
                      <td style="background-color: #ffffff;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td style="padding: 40px 30px; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555;">
                                      <h1 style="margin: 0 0 20px; font-size: 24px; line-height: 30px; color: #333333; font-weight: bold;">Welcome Aboard!</h1>
                                      <p style="margin: 0 0 20px;">Hi there,</p>
                                      <p style="margin: 0 0 30px;">
                                          You have been invited to Travel Buddy
                                      </p>
                                      
                                      <table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom: 30px;">
                                          <tr>
                                              <td align="left" style="padding: 20px; background-color: #f0f0f0; border-radius: 5px;">
                                                  <p style="margin: 0 0 15px; font-family: Arial, sans-serif; font-size: 14px; color: #555555;">Below are your login credentials:</p>
                                                  <p style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 16px; color: #333333;">
                                                      <strong>Username:</strong> ${email}
                                                  </p>
                                                   <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; color: #333333;">
                                                      <strong>Password:</strong> ${password}
                                                  </p>
                                              </td>
                                          </tr>
                                      </table>
                                      <p style="margin: 0 0 15px;">For security reasons, we strongly recommend changing your password after your first login.</p>
                                      <p style="margin: 0 0 15px;">Link to password recovery: <a href="${recovery_link}">Change Password</a></p>
                                      <p style="margin: 0 0 30px;">If your email is linked to a Google or Apple account, you can also use those options to sign in.</p>
                                      
                                      <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                                          <tr>
                                              <td align="center" style="border-radius: 5px; background-color: #007bff;">
                                                  <a 
                                                      href="${redirect_link}" 
                                                      target="_blank" 
                                                      style="font-size: 16px; font-family: Arial, sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 5px; padding: 15px 25px; border: 1px solid #007bff; display: inline-block;"
                                                  >
                                                      Click Here to Login
                                                  </a>
                                              </td>
                                          </tr>
                                      </table>
                                      </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
                  <tr>
                      <td style="background-color: #ffffff; border-top: 1px solid #eeeeee;">
                           <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td style="padding: 20px 30px; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; color: #555555;">
                                      <p style="margin: 0;">Best regards,</p>
                                      <p style="margin: 5px 0 0;">
                                          <strong>The Travel Buddy Team</strong>
                                      </p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>

                  <tr>
                      <td style="padding: 20px 30px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #888888;">
                          <p style="margin: 0;">This email was sent to you because you were added as a team member on Travel Buddy.</p>
                          <p style="margin: 10px 0;">Travel Buddy | Ho Chi Minh City</p>
                          <p style="margin: 10px 0 0;">
                             Questions? <a href="mailto:hello@travelbuddy8.com" style="color: #888888; text-decoration: underline;">Contact our support team.</a>
                          </p>
                      </td>
                  </tr>
              </table>
              </td>
      </tr>
  </table>
</body>
</html>
  `;
}
  

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const token = req.headers.authorization?.split(' ')[1];
  let visitorFinalData;

  try {

    const { experience_id, company_id, email, language, redirect_link } = req.body;

    const { data: visitorData } = await supabase
      .from("visitors")
      .select('*')
      .eq("email", email)
      .eq("experience_id", experience_id)
      .single();

    if (!visitorData) {
      if (!company_id && !experience_id) {
        const { data, error } = await supabase
        .from("visitors")
        .insert({
          email,
          language,
        })
        .select("*")
        .single();

        if (error) {
          console.log(error.message);
        }

        visitorFinalData = data;

        // return res.status(200).json({
        //   data: {
        //     visitor_id: data.id,
        //     language: data.language,
        //   }
        // });
      }

      if (company_id) {
        const { data, error } = await supabase
        .from("visitors")
        .insert({
          email,
          language,
          company_id,
        })
        .select("*")
        .single();

        if (error) {
          console.log(error.message);
        }

        visitorFinalData = data;

      } 
      
      if (experience_id) {
        const { data: expData } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", experience_id)
        .single();
      
      const { data, error } = await supabase
        .from("visitors")
        .insert({
          experience_id,
          email,
          language,
          company_id: expData.owned_by,
        })
        .select("*")
        .single();

        if (error) {
          console.log(error.message);
        }

        visitorFinalData = data;
      }
    }

    // User creation flow
    let userProfileUpToDate;

    // Check if user profile exists
    const { data: userprofileData } = await supabase
      .from('userprofiles')
      .select('*')
      .eq('email', email)
      .single();
    
    userProfileUpToDate = userprofileData;

    // If not, create a new user and profile
    if (!userProfileUpToDate) {
      let companyName;
      if(company_id && !experience_id){
        const { data: company } = await supabase
          .from('company_accounts')
          .select('*')
          .eq('id', company_id)
          .single();

        if (!company) {
          return res.status(400).json({ error: 'Company not found' });
        }

        companyName = company.name;
      }

      if(!company_id && experience_id){
        const { data: experience } = await supabase
          .from('experiences')
          .select('id,company_accounts(name)')
          .eq('id', experience_id)
          .single();

        if (!experience) {
          return res.status(400).json({ error: 'Experience not found' });
        }

        if (!experience.company_accounts?.[0]) {
          return res.status(400).json({ error: 'No company found for experience' });
        }

        companyName = experience.company_accounts?.[0]?.name;
      }

      const password = generateRandomPassword(8);
                    
      const { data: { user, session }, error: userError } = await supabase.auth.signUp({ email, password });

      if (userError) {
          return res.status(400).json({ error: userError.message });
      }

      const userId = user?.id;
      const accessToken = session?.access_token;
      console.log(userId);
      console.log(token);

      const { data: userprofileData, error: userprofileError } = await supabase
        .from("userprofiles")
        .insert({
          userid: userId,
          email,
          language,
        })
        .select("*")
        .single();

      if (userprofileError) {
        return res.status(400).json({ error: userprofileError.message });
      }

      userProfileUpToDate = userprofileData;

      console.log(userprofileData);

      const redirectLinkHost = (new URL(redirect_link)).host;

      const emailBodyNewMember = userCreationEmailTemplate({
        companyName,
        email,
        password,
        redirect_link,
        recovery_link: `https://${redirectLinkHost}/auth/forgot-password`,
      });

      const { data: mailSendResp, error: mailSendError } = await mailSendHandler({
        sender: 'hello@travelbuddy8.com',
        senderName: 'Travel Buddy',
        to: [email],
        bcc: ["trac.nguyen@edge8.ai"],
        subject: 'Welcome to Travel Buddy',
        html: emailBodyNewMember,
      });

      if (mailSendError) {
        console.log(mailSendError);
      }

      console.log(mailSendResp);

      return res.status(200).json({
        data: {
          visitor_id: visitorFinalData.id,
          experience_id: visitorFinalData.experience_id,
          language: visitorFinalData.language,
          company_id: visitorFinalData.company_id,
          profile: userProfileUpToDate,
          access_token: accessToken,
          refresh_token: session?.refresh_token,
        }
      });
    }

    if (language != userProfileUpToDate.language) {
      const { data: updatedUserprofileData } = await supabase
        .from('userprofiles')
        .update({ language })
        .eq('email', email)
        .eq('userid', userProfileUpToDate.userid)
        .select("*")
        .single();

      userProfileUpToDate = updatedUserprofileData;
    }

    // Recorded vistor without the user creation flow
    return res.status(200).json({
      data: {
        visitor_id: visitorFinalData.id,
        experience_id: visitorFinalData.experience_id,
        language: visitorFinalData.language,
        company_id: visitorFinalData.company_id,
        profile: userProfileUpToDate,
        access_token: null,
        refresh_token: null,
      }
    });

  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Workaround to enable Swagger on production 
export const swaggerExpTravelerInfoCreate = {
  index: 17,
  text:
    ``
}