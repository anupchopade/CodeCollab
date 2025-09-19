import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test the connection
(async () => {
  try {
    await transporter.verify();
    console.log("�� Gmail server is ready to send messages");
  } catch (err) {
    console.error("❌ Gmail server connection failed:", err);
  }
})();

export const sendMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to,
      subject: "Your OTP for CodeCollab",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });
    
    console.log("✅ Email sent successfully:", info.messageId);
    console.log("📧 Sent to:", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};




// import nodemailer from "nodemailer";

// // Create a real test account (no fake credentials)
// let transporter;

// const createTestTransporter = async () => {
//   try {
//     // Create a real test account
//     const testAccount = await nodemailer.createTestAccount();
    
//     transporter = nodemailer.createTransport({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       secure: false,
//       auth: {
//         user: testAccount.user,
//         pass: testAccount.pass
//       }
//     });

//     // Verify the connection
//     await transporter.verify();
//     console.log("📨 Test mail server is ready");
//     console.log("🔑 Test account created:", testAccount.user);
//   } catch (err) {
//     console.error("❌ Test mail server connection failed:", err);
//   }
// };

// // Initialize the transporter
// createTestTransporter();

// export const sendMail = async (to, otp) => {
//   try {
//     if (!transporter) {
//       throw new Error("Transporter not initialized");
//     }

//     const info = await transporter.sendMail({
//       from: 'test@ethereal.email',
//       to: to,
//       subject: "Your OTP for CodeCollab",
//       text: `Your OTP is ${otp}. It expires in 5 minutes.`
//     });
    
//     console.log("✅ Test email sent:", info.messageId);
//     console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
//     console.log("📧 OTP:", otp); // Also log the OTP for testing
//   } catch (error) {
//     console.error("❌ Error sending test email:", error);
//     throw error;
//   }
// };