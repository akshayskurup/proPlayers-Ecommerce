const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const otpGenerator = require('generate-otp');
const signupController = {};

  
// Function to send OTP to the user's email
const sendOTP = async (email, otp) => {
  if (!email) {
    throw new Error('No recipients defined');
  }
  // Configure your nodemailer transporter with your Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'akshayskurup@gmail.com', // Replace with your Gmail email address
      pass: 'dotj njnv mmgu bpot', // Replace with your Gmail app password
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
    throw error; 
  }
};

signupController.showSignupForm = (req, res) => {
  
  if (req.session.UserLogin) {
    console.log('home error',UserLogin._id)
    res.redirect(`/home/${req.session.userId}`);
  } else {
    res.render('signup', { message: '' });
  }
};


signupController.handleSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  console.log("Form Body:", req.body);

  if (existingUser) {
    // Handle the case where the email already exists
    return res.render("signup", { message: "Email already exists"});
  }

  // Generate OTP
  const generatedOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

  // Store OTP and email in session (you might want to use a more secure storage for production)
  req.session.signupData = {
    name,
    email,
    password,
    generatedOTP,
    timestamp: Date.now(),
  };
  console.log("Email to send OTP:", req.session.signupData.email);
  console.log("Form Body:", req.body);
  try {
    // Send OTP to the user's email
    await sendOTP(email, generatedOTP);

    // Redirect to OTP input form
    res.redirect(`/signup-otp?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
  } catch (err) {
    console.error("Error during OTP sending:", err);
    res.redirect("/signup");
  }
};


signupController.showOTP = (req, res) => {
  const email = req.query.email;
  const name = req.query.name;
  res.render('signupOTP',{message:"",email,name});
};


signupController.verifyOTP = async (req, res) => {
  const { enteredOTP } = req.body;
  const signupData = req.session.signupData;
  const email = req.query.email;
  const name = req.query.name;

  const otpExpirationTime = 50 * 1000;
  if (Date.now() - signupData.timestamp > otpExpirationTime) {
      // OTP has expired
      res.render('signupOTP', { message: 'OTP has expired. Please request a new one.', email, name });
      return;
  }

  if (enteredOTP === signupData.generatedOTP) {
      // OTP is correct, save the user to the database
      const saltround = 10;
      const hashedPassword = await bcrypt.hash(signupData.password, saltround);
      const newUser = new User({
          name: signupData.name,
          email: signupData.email,
          password: hashedPassword,
      });

      try {
          // Save the user to the database
          const savedUser = await newUser.save();

          // Set session variables
          req.session.UserLogin = true;
          req.session.userId = savedUser._id;

          // Clear the signupData from session
          delete req.session.signupData;

          // Redirect to home or a success page
          res.redirect(`/home/${savedUser._id}`);
      } catch (err) {
          console.error('Error during database save:', err);
          res.render('signup', { message: 'Error during signup. Please try again.' });
      }
  } else {
      // Incorrect OTP
      res.render('signupOTP', { message: 'Incorrect OTP. Please try again.', email, name });
  }
};

signupController.resendOtp = async (req, res) => {
  // Check if signupData is set in the session
  if (!req.session.signupData) {
    return res.json({ success: false, message: 'signupData not found in session' });
  }

  const signupData = req.session.signupData;

  // Check if the time since the last OTP request is more than 15 seconds
  const resendCooldown = 15 * 1000; // 15 seconds in milliseconds
  if (Date.now() - signupData.timestamp < resendCooldown) {
    return res.json({ success: false, message: 'Resend cooldown not met' });
  }

  // Clear the previously sent OTP from the session
  delete req.session.signupData.generatedOTP;

  // Generate a new OTP
  const newOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

  // Update the stored signup data with the new OTP and timestamp
  req.session.signupData.generatedOTP = newOTP;
  req.session.signupData.timestamp = Date.now();

  // Send the new OTP to the user's email
  try {
    await sendOTP(signupData.email, newOTP);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Error during resend:', err);
    res.json({ success: false, message: 'Error during resend' });
  }
};



module.exports = signupController;