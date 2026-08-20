const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendVisitNotification(visit) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.EMAIL_TO || 'risha@ishrpeople.com',
    subject: 'New Visit Request',
    text: `New visit request submitted:\n\nName: ${visit.name}\nPreferred date: ${visit.date}\nSubmitted: ${visit.createdAt.toISOString()}`,
  });
}

module.exports = { sendVisitNotification };
