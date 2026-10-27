import "dotenv/config";
import nodemailer from "nodemailer";

const requiredMailVariables = [
    "GOOGLE_USER",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REFRESH_TOKEN",
];

function getMailVariable(name) {
    const value = process.env[name]?.trim();

    if (!value) {
        return "";
    }

    if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1).trim();
    }

    return value;
}

function getMissingMailVariables() {
    return requiredMailVariables.filter((name) => !getMailVariable(name));
}

function createTransporter() {
    const missingVariables = getMissingMailVariables();
    if (missingVariables.length > 0) {
        const error = new Error(
            `Email service is not configured. Missing: ${missingVariables.join(", ")}`
        );
        error.code = "EMAIL_CONFIG_MISSING";
        throw error;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: getMailVariable("GOOGLE_USER"),
            clientSecret: getMailVariable("GOOGLE_CLIENT_SECRET"),
            refreshToken: getMailVariable("GOOGLE_REFRESH_TOKEN"),
            clientId: getMailVariable("GOOGLE_CLIENT_ID"),
        },
    });
}

export async function sendEmail({ to, subject, html, text }) {
    const transporter = createTransporter();

    const mailOptions = {
        from: getMailVariable("GOOGLE_USER"),
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
        const deliveryError = new Error("Email provider rejected the verification email");
        deliveryError.code = "EMAIL_PROVIDER_REJECTED";
        deliveryError.cause = error;
        throw deliveryError;
    }
}