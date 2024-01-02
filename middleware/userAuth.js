const User = require('../model/userSchema')
const bcrypt = require('bcrypt')

const userAuth = async(req,res,next)=>{
    try {
        const {email,password}=req.body
        
        const user = await User.findOne({email})

        if(!user){
           return res.render('User/login',{message:"No User Found"})
        }

        if(user.isBlocked){
            return res.render('User/login',{message:"Access Blocked"})
        }

        const passwordMatch = await bcrypt.compare(password,user.password)
        if(!passwordMatch){
            return res.render('User/login',{message:"Wrong Password"})
        }
        req.session.UserLogin = true;
        req.session.userId = user._id
        next()
    } catch (error) {
        console.error('Error in checkCredentialsMiddleware:', error);
    res.status(500).send('Internal Server Error');
    }
}

module.exports = userAuth