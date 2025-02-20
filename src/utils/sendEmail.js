import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";


export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
            secure: true
        });        

        const mailOptions = {
            from: process.env.GMAIL_USER, 
            to: to,                      
            subject: subject,
            text: text,
        };

        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new ApiError(400, error?.message || "Error in sending the message");
    }
};
