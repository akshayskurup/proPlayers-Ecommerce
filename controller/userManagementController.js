const User = require('../model/userSchema')
const bcrypt = require('bcrypt')
const userManagementController = {}

userManagementController.showData = async(req,res)=>{
    
    try{
        const message = req.query.message
        const users = await User.find()
        res.render('userManagement',{users,message})
    }
    catch(err){
        res.status(500).send("Server Error")
    }
}

userManagementController.handleData = async (req,res)=>{
    
    const {name,email,phone,password} = req.body
    const existingUser = await User.findOne({ email });
    const users = await User.find()

      if (existingUser) {
        // Handle the case where the email already exists
        return res.redirect('/user-management?message=Email already exists');
      }
    const saltround = 10;
    const hashedPassword = await bcrypt.hash(password,saltround);
    const newUser = new User({
        name,
        email,
        phone,
        password:hashedPassword
    })
    await newUser
    .save()
    .then(()=> res.redirect('/user-management?message=Successfully inserted'))
    .catch((err) =>
      console.error('Error during inserting data:', err)
      
      )} 




      userManagementController.blockUser = async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send('User not found');
            }
            // Toggle the isBlocked field
            user.isBlocked = !user.isBlocked || false;
            await user.save();
    
            res.redirect('/user-management');
        } catch (error) {
            console.error('Error toggling user block status:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
    userManagementController.unblockUser = async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
    
            // Set isBlocked to false
            user.isBlocked = false;
            await user.save();
    
            res.redirect('/user-management');
        } catch (error) {
            console.error('Error setting isBlocked to false:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    



module.exports = userManagementController