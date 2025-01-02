const sendEmail = async ({ to ,mediaUrl}) => {
  const response = await fetch("/api/email/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: to,
      mediaUrl: mediaUrl
    }),
  });

  if (response.ok) {
    console.log("Email sent successfully!");
  } else {
    console.error("Failed to send email.");
  }
};
