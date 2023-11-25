let User = require('../model/userSchema')
const loginController = {};
const bcrypt = require("bcrypt")


loginController.showLoginForm = (req, res) => {
   console.log('login',req.session.UserLogin)
    if(req.session.UserLogin){
        res.redirect(`/home/${req.session.userId}`)
    }
    else{
        res.render('login',{message:""});
    }
    
};

loginController.handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.render("login", { message: "No user found" });
    }

    req.session.userId = user._id;

    if (user.isBlocked) {
        return res.render("login", { message: "Access Blocked" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.render("login", { message: "Password is incorrect" });
    }

    req.session.UserLogin = true;
    res.redirect(`/home/${user._id}`);
};

module.exports = loginController;
