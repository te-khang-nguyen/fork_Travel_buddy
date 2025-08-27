import sgMail from '@sendgrid/mail';
import postmark from 'postmark';

export default async function mailSendHandler({
    sender, senderName, to, cc, bcc, subject, html
}:{
    sender: string,
    senderName: string,
    to: string[],
    cc?: string[],
    bcc?: string[],
    subject: string,
    html: string,
}) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

    const client = new postmark.ServerClient("67824027-a6af-4fca-94e6-b6212e36ae9d");


    const postMarkPayload = {
        "From": `${senderName} <${sender}>`,
        "To": to.join(","),
        "Cc": cc?.join(","),
        "Bcc": bcc?.join(","),
        "Subject": subject,
        "HtmlBody": html,
        "MessageStream": "outbound"
      }
  
    try {
        const response = client.sendEmail(postMarkPayload);
        return {data: response, error: null};
    } catch (error) {
        console.error(error);
        return {data: null, error};
    }
}
