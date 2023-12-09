let User = require('../model/userSchema')
const loginController = {};
const bcrypt = require("bcrypt")


loginController.showLoginForm = (req, res) => {
   console.log('login',req.session.UserLogin)
    if(req.session.UserLogin){
        res.redirect('/home')
    }
    else{
        res.render('login',{message:""});
    }
    
};

loginController.handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    req.session.userId = user._id;
    req.session.UserLogin = true;
    res.redirect("/home");
};

module.exports = loginController;
