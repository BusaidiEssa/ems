import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nodemailer Working ✅',
      text: 'Your EMS email system is working correctly.',
    });

    console.log('✅ Email sent:', info.response);
  } catch (err) {
    console.error('❌ Email failed');
    console.error(err);
  }
}

sendTestMail();
