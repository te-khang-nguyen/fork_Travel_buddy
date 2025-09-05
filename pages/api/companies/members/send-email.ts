import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

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
  
    try {
        const { data, error } = await resend.emails.send({
            from: `${senderName} <${sender}>`,
            to: to,
            cc: cc,
            bcc: bcc,
            subject: subject,
            html: html,
        });

        return {data: data, error: error};
    } catch (error) {
        console.error(error);
        return {data: null, error};
    }
}
