let User = require("../model/userSchema");
const bcrypt = require("bcrypt");

const signupController = {};

signupController.showSignupForm = (req, res) => {
  if(req.session.UserLogin){
    res.redirect('/home')
  }else{

    res.render("signup", { message: "" });
  }
};
signupController.handleSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    // Handle the case where the email already exists
    return res.render("signup", { message: "Email already exists" });
  }
  const saltround = 10;
  const hashedPassword = await bcrypt.hash(password, saltround);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });
  try {
    // Save the user to the database
    const savedUser = await newUser.save();

    // Set session variables
    req.session.UserLogin = true;
    req.session.userId = savedUser._id;
    res.redirect(`/home/${savedUser._id}`);
  }
  catch(err){
    console.error("Error during signup:", err);
  }
};

module.exports = signupController;
