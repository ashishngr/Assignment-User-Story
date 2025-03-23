import nodemailer from "nodemailer";
import logger from "./logger.js";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error("Email sending error", { error: error.message });
  }
};

export default sendEmail;
