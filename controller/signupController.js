const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const otpGenerator = require('generate-otp');
const signupController = {};


  
// Function to send OTP to the user's email
// const sendOTP = async (email, otp) => {
//   if (!email) {
//     throw new Error('No recipients defined');
//   }
//   // Configure your nodemailer transporter with your Gmail SMTP settings
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'akshayskurup@gmail.com', // Replace with your Gmail email address
//       pass: 'dotj njnv mmgu bpot', // Replace with your Gmail app password
//     },
//   });

//   // Email content
//   const mailOptions = {
//     from: 'akshayskurup@gmail.com',
//     to: email,
//     subject: 'OTP Verification',
//     text: `Your OTP for email verification is: ${otp}`,
//   };

//   try {
//     // Send OTP to the user's email
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; 
//   }
// };

// signupController.showSignupForm = (req, res) => {
  
//   if (req.session.UserLogin) {
//     console.log('home error',UserLogin._id)
//     res.redirect("/home");
//   } else {
//     res.render('signup', { message: '' });
//   }
// };


// signupController.handleSignup = async (req, res) => {
//   const { name, email, password } = req.body;
//   const existingUser = await User.findOne({ email });
//   console.log("Form Body:", req.body);

//   if (existingUser) {
//     // Handle the case where the email already exists
//     return res.render("signup", { message: "Email already exists"});
//   }

//   // Generate OTP
//   const generatedOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

//   // Store OTP and email in session (you might want to use a more secure storage for production)
//   req.session.signupData = {
//     name,
//     email,
//     password,
//     generatedOTP,
//     timestamp: Date.now(),
//   };
//   console.log("Email to send OTP:", req.session.signupData.email);
//   console.log("Form Body:", req.body);
//   try {
//     // Send OTP to the user's email
//     await sendOTP(email, generatedOTP);

//     // Redirect to OTP input form
//     res.redirect(`/signup-otp?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
//   } catch (err) {
//     console.error("Error during OTP sending:", err);
//     res.redirect("/signup");
//   }
// };


// signupController.showOTP = (req, res) => {
//   const email = req.query.email;
//   const name = req.query.name;
//   res.render('signupOTP',{message:"",email,name});
// };


// signupController.verifyOTP = async (req, res) => {
//   const { enteredOTP } = req.body;
//   const signupData = req.session.signupData;
//   const email = req.query.email;
//   const name = req.query.name;

//   const otpExpirationTime = 50 * 1000;
//   if (Date.now() - signupData.timestamp > otpExpirationTime) {
//       // OTP has expired
//       res.render('signupOTP', { message: 'OTP has expired. Please request a new one.', email, name });
//       return;
//   }

//   if (enteredOTP === signupData.generatedOTP) {
//       const saltround = 10;
//       const hashedPassword = await bcrypt.hash(signupData.password, saltround);
//       const newUser = new User({
//           name: signupData.name,
//           email: signupData.email,
//           password: hashedPassword,
//       });

//       try {
//           const savedUser = await newUser.save();
//           req.session.UserLogin = true;
//           req.session.userId = savedUser._id;
//           delete req.session.signupData;
//           res.redirect('/home');
//       } catch (err) {
//           console.error('Error during database save:', err);
//           res.render('signup', { message: 'Error during signup. Please try again.' });
//       }
//   } else {
//       res.render('signupOTP', { message: 'Incorrect OTP. Please try again.', email, name });
//   }
// };

// signupController.resendOtp = async (req, res) => {
//   // Check if signupData is set in the session
//   if (!req.session.signupData) {
//     return res.json({ success: false, message: 'signupData not found in session' });
//   }

//   const signupData = req.session.signupData;

//   // Check if the time since the last OTP request is more than 15 seconds
//   const resendCooldown = 15 * 1000; // 15 seconds in milliseconds
//   if (Date.now() - signupData.timestamp < resendCooldown) {
//     return res.json({ success: false, message: 'Resend cooldown not met' });
//   }

//   // Clear the previously sent OTP from the session
//   delete req.session.signupData.generatedOTP;

//   // Generate a new OTP
//   const newOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

//   // Update the stored signup data with the new OTP and timestamp
//   req.session.signupData.generatedOTP = newOTP;
//   req.session.signupData.timestamp = Date.now();

//   // Send the new OTP to the user's email
//   try {
//     await sendOTP(signupData.email, newOTP);
//     res.json({ success: true, message: 'OTP resent successfully' });
//   } catch (err) {
//     console.error('Error during resend:', err);
//     res.json({ success: false, message: 'Error during resend' });
//   }
// };



// module.exports = signupController;



const sendOTP = async (email, otp) => {
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

signupController.showSignupForm = (req, res) => {
  if (req.session.UserLogin) {
    // console.log('home error', UserLogin._id)
    res.redirect("/home");
  } else {
    res.render('signup', { message: '' });

    req.session.signupUser = true
    req.session.save()
    console.log("signupUser",req.session.signupUser)
    console.log("signupUser1111",req.session)

  }
};

signupController.handleSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  console.log("Form Body:", req.body);

  if (existingUser) {
    return res.render("signup", { message: "Email already exists" });
  }

  const generatedOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

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
  console.log("signupUser",req.session)
  console.log("req.session.signupUser",req.session.signupUser)
  const email = req.query.email;
  const name = req.query.name;
  if(req.session.signupUser){
    res.render('signupOTP', { message: "", email, name });
  }else{
    res.redirect('/')
  }
};

signupController.verifyOTP = async (req, res) => {
  const { enteredOTP } = req.body;
  const signupData = req.session.signupData;
  const email = req.query.email;
  const name = req.query.name;

  // Check if signupData is missing
  if (!signupData) {
    return res.status(400).json({ success: false, message: 'Invalid or missing signup data' });
  }

  const otpExpirationTime = 50 * 1000;

  // Check if OTP has expired
  if (Date.now() - signupData.timestamp > otpExpirationTime) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  // Verify enteredOTP
  if (enteredOTP === signupData.generatedOTP) {
    const saltround = 10;
    const hashedPassword = await bcrypt.hash(signupData.password, saltround);
    const newUser = new User({
      name: signupData.name,
      email: signupData.email,
      password: hashedPassword,
    });

    try {
      const savedUser = await newUser.save();
      req.session.UserLogin = true;
      req.session.userId = savedUser._id;
      delete req.session.signupData;

      res.status(200).json({ success: true, message: 'Signup successful' });
      req.session.signupUser = false
      req.session.save()
      console.log("req.session.signupUser",req.session.signupUser)
    } catch (err) {
      console.error('Error during database save:', err);

      res.status(500).json({ success: false, message: 'Error during database save' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
  }
};

signupController.resendOtp = async (req, res) => {
  if (!req.session.signupData) {
    return res.json({ success: false, message: 'signupData not found in session' });
  }

  const signupData = req.session.signupData;

  const resendCooldown = 15 * 1000; 
  if (Date.now() - signupData.timestamp < resendCooldown) {
    return res.json({ success: false, message: 'Resend cooldown not met' });
  }

  delete req.session.signupData.generatedOTP;

  const newOTP = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

  req.session.signupData.generatedOTP = newOTP;
  req.session.signupData.timestamp = Date.now();

  try {
    await sendOTP(signupData.email, newOTP);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Error during resend:', err);
    res.json({ success: false, message: 'Error during resend' });
  }
};

module.exports = signupController;