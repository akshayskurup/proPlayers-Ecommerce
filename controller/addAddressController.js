const addAddressController = {}
const User = require('../model/userSchema')

addAddressController.showForm = (req,res)=>{
    res.render('addAddress')
}

addAddressController.handleData = async (req,res)=>{
    const userId = req.session.userId;
    const user = await User.findById(userId)
    const { mobile, houseName, street, city, pincode, state } = req.body;
    try {
        console.log("Inside try")
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
         console.log("checking ",user.address.mobile)
        console.log("Before if")
        if (!user.phone) {
            console.log("inside if")
            user.phone = mobile;
            console.log("Before save")
            await user.save();
            console.log("after save") 
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