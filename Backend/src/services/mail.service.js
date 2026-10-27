import "dotenv/config";
import nodemailer from "nodemailer";

const requiredMailVariables = [
    "GOOGLE_USER",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
];

function getMissingMailVariables() {
    return requiredMailVariables.filter((name) => !process.env[name]?.trim());
}

function createTransporter() {
    const missingVariables = getMissingMailVariables();
    if (missingVariables.length > 0) {
        throw new Error(`Email service is not configured. Missing: ${missingVariables.join(", ")}`);
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.GOOGLE_USER,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            clientId: process.env.GOOGLE_CLIENT_ID,
        },
    });
}

export async function sendEmail({ to, subject, html, text }) {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    try {
        const details = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}. Message ID: ${details.messageId}`);
    } catch (error) {
        console.error("Email delivery failed:", {
            code: error.code,
            response: error.response,
            command: error.command,
        });
        throw new Error("Email provider rejected the verification email");
    }
}