export const memberCreationEmailTemplate = ({
    companyName,
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
        You've been invited to join ${companyName} on Travel Buddy 8. Your login details are inside.
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
                                            You have been added as a member of <strong>${companyName}</strong> on the Trip report platform.
                                        </p>
                                        
                                        ${password ? `<table border="0" cellspacing="0" cellpadding="0" width="100%" style="margin-bottom: 30px;">
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
                                        <p style="margin: 0 0 15px;">For security reasons, we strongly recommend changing your password after your first login.</p>` : ''}
                                        ${!password ? `<p style="margin: 0 0 15px;">For security reasons, if you have not changed your password after your first login, we recommend changing your password.</p>` : ''}
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
                                            <strong>The Travel Buddy 8 Team</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px 30px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color: #888888;">
                            <p style="margin: 0;">This email was sent to you because you were added as a team member on Travel Buddy 8.</p>
                            <p style="margin: 10px 0;">Travel Buddy 8 | Ho Chi Minh City</p>
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
    