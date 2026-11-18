import { Resend } from "resend";
import dotenv from "dotenv"
dotenv.config() // must here

 // nodemailer removed from here >> 

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  const { data, error } = await resend.emails.send({
    from: `ShopSphere Support <${process.env.EMAIL_FROM}>`,
    to: [options.email],
    subject: options.subject, // subject line
    text: options.message,
    html: options.html, // main formate
  });

  if (error) {
    // console.error("Resend email error:", error);
    throw new Error(error.message);
  }

  // console.log("Email sent successfully:", data.id);

  return data;
};

export default sendEmail;


//  WE ARE USING EXTERNAL API KEY >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/*   
import nodemailer from "nodemailer"; 
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
    from: `"Shop Sphere: e-commerce Support" <${process.env.EMAIL_USER}>`,
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


export default sendEmail;
 */