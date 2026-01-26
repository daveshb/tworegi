import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, mensajeHtml, asunto } = req.body;

  const userMail = process.env.MAIL_USER;
  const passMail = process.env.MAIL_PASS;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: userMail,
        pass: passMail,
      },
    });

    await transporter.sendMail({
      from: '"Foncor" <no-reply@corona.com>', // sender address
      to: email, // list of receivers
      subject: asunto, // Subject line
      html: mensajeHtml
    });

    if (req.method === "POST") {
      res.status(200).json({ res: "Mensaje enviado" });
    } else {
      res.status(405).json({ res: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ res: error });
  }
};

export default handler;
