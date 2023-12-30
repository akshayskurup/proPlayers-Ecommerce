const nodemailer = require('nodemailer');
const User = require('../model/userSchema');
const bcrypt = require('bcrypt');
const otpGenerator = require('generate-otp');
const wallet = require('../model/walletSchema')
const signupController = {};


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
  const { name, email, password,referral } = req.body;
  const existingUser = await User.findOne({ email });
  console.log("Form Body:", req.body);

  if (existingUser) {
    return res.render("signup", { message: "Email already exists" });
  }
  console.log("refff",req.session.referral)
console.log("ref input",referral)
  const user = await User.findOne({referralCode:referral})
  console.log("Reff user",user)
    if(user){
      req.session.referral = user._id
      console.log("session",req.session)
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
    await sendOTP(email, generatedOTP);

    // Redirect to OTP input form
    res.redirect(`/signup-otp?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
  } catch (err) {
    console.error("Error during OTP sending:", err);
    res.redirect("/signup");
  }
};

signupController.checkReferral = async(req,res)=>{
  const referralCode = req.query.referralCode
  try{
    const user = await User.findOne({referralCode:referralCode})
    if(user){
      req.session.referral = user._id
      res.json({ valid: true });
      console.log("session",req.session)
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error('Error checking referral code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

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
      referralCode:generateCode(),
      referredBy:req.session.referral?req.session.referral:null
    });

    try {
      const savedUser = await newUser.save();
      if(savedUser.referredBy && savedUser.referredBy!=null){
        const newWallet = new wallet({
        userId: savedUser._id,
        balance: 100,
        transactionHistory:[{
          transaction: 'Money Added',
          amount: 100,
      }]
      });
      await newWallet.save();

      const existingWallet = await wallet.findOne({userId:req.session.referral})
      //referred BY 
      if (existingWallet) {
        existingWallet.balance += 100;
        existingWallet.transactionHistory.push({
          transaction: 'Money Added',
          amount: 100,
        });
      await existingWallet.save();

      }
      }
      
      

      req.session.UserLogin = true;
      req.session.userId = savedUser._id;
      delete req.session.signupData;
      delete req.session.referral

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

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 5;
  let randomCode = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters.charAt(randomIndex);
  }

  return randomCode;
}

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