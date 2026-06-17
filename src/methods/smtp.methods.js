import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load Environment Variables
dotenv.config({
  path: ".env"
});

// Debug Logs
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// Create SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send Email Method
export const sendEmail = async ({ to, subject, text }) => {

  try {

    // Email Options
    const mailOptions = {
      from: process.env.EMAIL_USER,
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