import nodemailer from "nodemailer";

// Send Email Method
export const sendEmail = async (userData, { to, subject, text }) => {

  // Create SMTP Transporter
  const transporter = nodemailer.createTransport({
    host: userData.smtp.host,
    port: Number(userData.smtp.port),
    secure: userData.smtp.secure,
    auth: {
      user: userData.smtp.auth.user,
      pass: userData.smtp.auth.pass
    }
  });

  try {

    // Email Options
    const mailOptions = {
      from: userData.smtp.auth.user,
      to,
      subject,
      text
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted
    };

  } catch (error) {

    console.error("SMTP ERROR:", error.message);

    return {
      success: false,
      message: error.message
    };

  }

};