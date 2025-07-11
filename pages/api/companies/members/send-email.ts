import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_KEY!);

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
    const rawMessage: sgMail.MailDataRequired = {
        to: to,
        from: {
          name: senderName,
          email: sender
        },
        cc: cc ?? [],
        bcc: bcc ?? [],
        subject: subject,
        html: html,
      };
  
    try {
        const response = await sgMail.send(rawMessage);
        return {data: response, error: null};
    } catch (error) {
        console.error(error);
        return {data: null, error};
    }
}
