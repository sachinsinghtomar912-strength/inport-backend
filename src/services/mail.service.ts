import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

const encodeBase64Url = (input: string) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export const sendGmail = async ({
  to,
  from,
  replyTo,
  subject,
  html,
  file,
}: {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  file?: Express.Multer.File;
}) => {
  const boundary = "inport_boundary_123";

  let message = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    "",
    html,
  ].filter(Boolean).join("\r\n");

  if (file) {
    message += [
      "",
      `--${boundary}`,
      `Content-Type: ${file.mimetype}; name="${file.originalname}"`,
      `Content-Disposition: attachment; filename="${file.originalname}"`,
      "Content-Transfer-Encoding: base64",
      "",
      file.buffer.toString("base64"),
    ].join("\r\n");
  }

  message += `\r\n--${boundary}--`;

  return gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodeBase64Url(message),
    },
  });
};