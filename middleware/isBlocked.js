const User  = require('../model/userSchema')


const checkBlocked = async (req,res,next)=>{
    try {
        const userId = req.session.userId
        const user = await User.findById(userId)


    if (user && user.isBlocked) {
        return res.redirect('/')
      }
      next();
    } catch (error) {
        console.error('Error in checkBlocked middleware:', error);
    res.status(500).send('Internal Server Error');
    }
}

module.exports = checkBlocked