const addAddressController = {}
const User = require('../model/userSchema')
const category = require('../model/categorySchema')

addAddressController.showForm = async (req,res)=>{
    categories = await category.find()
    res.render('User/addAddress',{categories})
}

addAddressController.handleData = async (req,res)=>{
    const userId = req.session.userId;
    const user = await User.findById(userId)
    const { mobile, houseName, street, city, pincode, state } = req.body;
    try {
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    address: {
                        mobile,
                        houseName,
                        street,
                        city,
                        pincode,
                        state,
                    },
                },
            },
            { new: true }
        );
        if (!user.phone) {
            user.phone = mobile;
            await user.save();
        }

        

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.redirect("/checkOut");
    } catch (err) {
        console.error('Error during adding address:', err);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = addAddressController