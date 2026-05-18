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
  const mixedBoundary = `mixed_${Date.now()}`;
  const relatedBoundary = `related_${Date.now()}`;
  const isImage = file?.mimetype.startsWith("image/");

  let message = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    `Content-Type: multipart/related; boundary="${relatedBoundary}"`,
    "",
    `--${relatedBoundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
  ]
    .filter(Boolean)
    .join("\r\n");

  if (isImage && file) {
    message += [
      "",
      `--${relatedBoundary}`,
      `Content-Type: ${file.mimetype}; name="${file.originalname}"`,
      `Content-Disposition: inline; filename="${file.originalname}"`,
      "Content-ID: <uploaded-image>",
      "Content-Transfer-Encoding: base64",
      "",
      file.buffer.toString("base64"),
    ].join("\r\n");
  }

  message += `\r\n--${relatedBoundary}--`;

  if (file && !isImage) {
    message += [
      "",
      `--${mixedBoundary}`,
      `Content-Type: ${file.mimetype}; name="${file.originalname}"`,
      `Content-Disposition: attachment; filename="${file.originalname}"`,
      "Content-Transfer-Encoding: base64",
      "",
      file.buffer.toString("base64"),
    ].join("\r\n");
  }

  message += `\r\n--${mixedBoundary}--`;

  return gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodeBase64Url(message),
    },
  });
};