"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactRequest = void 0;
const express_1 = require("express");
const mail_service_1 = require("../services/mail.service");
const sendContactRequest = async (req, res) => {
    try {
        const { company, vessel, port, eta, supply, email, phone, notes } = req.body;
        const file = req.file;
        if (!company || !vessel || !port || !eta || !supply || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }
        await mail_service_1.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
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
    }
    catch (error) {
        console.error("Mail Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send request",
        });
    }
};
exports.sendContactRequest = sendContactRequest;
//# sourceMappingURL=contact.controller.js.map