
import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config() // must here


// this is used to you want to share any thing throught the mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587, // default nodemailer port 587
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// mail format  
const sendEmail = async (options) => {
  return await transporter.sendMail({
    from: `"E-commerce Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject, // subject
    text: options.message,
    html: options.html, // mail desing
  });
};


/*  TESTING - DEVELOPER MODE
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded:", Boolean(process.env.EMAIL_PASS));

*/
export default sendEmail;
