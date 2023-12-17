const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const otpGenerator = require('generate-otp');
const passwordResetController = {};

// Function to send OTP to the user's email
const sendOTP = async (email, otp) => {
    if (!email) {
      throw new Error('No recipients defined');
    }
    // Configure your nodemailer transporter with your Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'akshayskurup@gmail.com', 
        pass: 'dotj njnv mmgu bpot', 
      },
    });
  
    // Email content
    const mailOptions = {
      from: 'akshayskurup@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for email verification is: ${otp}`,
    };
  
    try {
      // Send OTP to the user's email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Rethrow the error to handle it in the calling function
    }
  };

passwordResetController.forgotPasswordForm = (req, res) => {
    res.render('passwordReset', { message: '' });
};

passwordResetController.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.render('passwordReset', { message: 'User not found' });
    }

    // Generate OTP
    const generatedOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    console.log('Before setting resetPasswordData:', req.session);
    // Store OTP and email in session
    req.session.resetPasswordData = {
        email,
        generatedOTP,
        timestamp: Date.now(),
    };

    console.log('After setting resetPasswordData:', req.session);

    // Send OTP to the user's email
    try {
        await sendOTP(email, generatedOTP);
        res.redirect('/reset-password/verify-otp');
    } catch (err) {
        console.error('Error during OTP sending:', err);
        res.render('passwordReset', { message: 'Error during OTP sending. Please try again.' });
    }
};


passwordResetController.showOTPForm = (req, res) => {
    res.render('resetOtp', { message: '', email: req.session.resetPasswordData.email });
};

passwordResetController.verifyOTPForPasswordReset = (req, res) => {
    const { enteredOTP } = req.body;
    const resetData = req.session.resetPasswordData;

    const otpExpirationTime = 10*5000; // 5 sec in milliseconds

    if (Date.now() - resetData.timestamp > otpExpirationTime) {
        // OTP has expired
        return res.render('resetOtp', { message: 'OTP has expired. Please request a new one.', email: resetData.email });
    }

    if (enteredOTP === resetData.generatedOTP) {
        res.redirect('/reset-password/new-password');
    } else {
        res.render('resetOtp', { message: 'Incorrect OTP. Please try again.', email: resetData.email });
    }
};
passwordResetController.resendOtp = async (req, res) => {
    if (!req.session.resetPasswordData) {
      return res.json({ success: false, message: 'resetPasswordData not found in session' });
    }
  
    const resetPasswordData = req.session.resetPasswordData;
  
    const resendCooldown = 15 * 1000; // 15 seconds in milliseconds
    if (Date.now() - resetPasswordData.timestamp < resendCooldown) {
      return res.json({ success: false, message: 'Resend cooldown not met' });
    }
  
    delete req.session.resetPasswordData.generatedOTP;
  
    // Generate a new OTP
    const newOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
  
    req.session.resetPasswordData.generatedOTP = newOTP;
    req.session.resetPasswordData.timestamp = Date.now(); 
  
    try {
      await sendOTP(resetPasswordData.email, newOTP);
      res.json({ success: true, message: 'OTP resent successfully' });
    } catch (err) {
      console.error('Error during resend:', err);
      res.json({ success: false, message: 'Error during resend' });
    }
};



passwordResetController.showPasswordResetForm = (req, res) => {
    res.render('passwordResetForm');
};

passwordResetController.resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    const resetData = req.session.resetPasswordData;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email: resetData.email }, { $set: { password: hashedPassword } });
        delete req.session.resetPasswordData;
        res.redirect('/'); 
    } catch (err) {
        console.error('Error updating password:', err);
        res.render('resetPassword', { message: 'Error updating password. Please try again.' });
    }
};

module.exports = passwordResetController;
