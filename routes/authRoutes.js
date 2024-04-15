const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

// Set up Google OAuth2 credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Nodemailer transporter using Google OAuth2
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USERNAME,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: async () => {
      const accessToken = await oauth2Client.getAccessToken();
      return accessToken;
    },
  },
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const mailOptions = {
      from: `"MERN Auth App" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Password Reset Verification",
      html: `
    <p>Hi there,</p>
      <br>
    <p>We received a request to reset the password for your account. To proceed with the password reset, please click on the link below:</p>
    <p>Click here : <a href="https://mernauthapp.vercel.app/ResetPw/${resetToken}">Reset Password</a></p>
    <br>
    <p>Please ensure you use this link within the next 1 hour as it will expire after that for security reasons.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>

    <br>
    <p>Best regards,</p>
    <p>MERN Auth App Team</p>
  `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Reset password email sent" });
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
