import { Request, Response } from "express";
import { transporter } from "../services/mail.service";

export const sendContactRequest = async (req: Request, res: Response) => {
  try {
    const { company, vessel, port, eta, supply, email, phone, notes } = req.body;
    const file = req.file;

    if (!company || !vessel || !port || !eta || !supply || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    await transporter.sendMail({
      from: process.env.GMAIL_SENDER_EMAIL,
      to: process.env.GMAIL_SENDER_EMAIL,
      replyTo: email,
      subject: `New Supply Request - ${company}`,
      html: `
        <h2>New Supply Request</h2>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Vessel:</strong> ${vessel}</p>
        <p><strong>Port:</strong> ${port}</p>
        <p><strong>ETA:</strong> ${eta}</p>
        <p><strong>Supply Type:</strong> ${supply}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Notes:</strong> ${notes || "No notes provided"}</p>
        <p><strong>Attachment:</strong> ${file ? file.originalname : "No attachment"}</p>
      `,
      attachments: file
        ? [
            {
              filename: file.originalname,
              content: file.buffer,
              contentType: file.mimetype,
            },
          ]
        : [],
    });

    return res.status(200).json({
      success: true,
      message: "Request sent successfully",
    });
  } catch (error) {
    console.error("Mail Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send request",
    });
  }
};