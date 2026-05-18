import { google } from "googleapis";
import dotenv from "dotenv";
import MailComposer from "nodemailer/lib/mail-composer";

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

const encodeBase64Url = (buffer: Buffer) =>
  buffer
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
  const attachments = file
    ? [
        {
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
          cid: file.mimetype.startsWith("image/") ? "uploaded-image" : undefined,
        },
      ]
    : [];

  const mail = new MailComposer({
    from,
    to,
    replyTo,
    subject,
    html,
    attachments,
  });

  const message = await mail.compile().build();

  return gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodeBase64Url(message),
    },
  });
};