const couponManagementController = {}
let coupon = require('../model/couponSchema')


couponManagementController.showData = async(req,res)=>{
  const couponData = await coupon.find().sort({_id:-1})
    res.render('couponManagement',{couponData})
}

couponManagementController.addCoupon = (req,res)=>{
    res.render('addCoupon')
}
couponManagementController.handleCoupon = async (req,res)=>{
    const {discountType,discountValue,minimumCartAmount,expiry} = req.body
    const existingCoupon = await coupon.find()
    function generateCouponCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let couponCode = '';
      
        for (let i = 0; i < 6; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          couponCode += characters.charAt(randomIndex);
        }
      
        return couponCode;
      }
    try{
        const newCoupon = new coupon({
            code:generateCouponCode(),
            discountType,
            discountValue,
            minimumCartAmount,
            expiry
          });
        const savedCoupon = await newCoupon.save()
        res.redirect('/coupon-management')
    }
    catch(err){
        console.error("Error during coupon creation:", err);
    res.status(500).send('Internal Server Error');
    }
    
    

}

couponManagementController.toggleListCategory = async (req, res) => {
  const couponId = req.params.id;

  try {
      const Coupon = await coupon.findById(couponId);

      if (Coupon) {
          // Toggle isListed value
          Coupon.isActive = !Coupon.isActive;
          await Coupon.save();
          res.redirect('/coupon-management');
      } else {
          res.status(404).send('Coupon not found');
      }
  } catch (error) {
      console.error('Error toggling coupon list status:', error);
      res.status(500).send('Internal Server Error');
  }
};

couponManagementController.showEditData = async(req,res)=>{
  const couponId = req.params.id
  const couponData = await coupon.findById(couponId)
  const formattedexpiry = couponData.expiry.toISOString().split('T')[0];
  try {
    res.render('editCoupon',{couponData,formattedexpiry})
  } catch (error) {
    console.error('Error on showEditData:', error);
      res.status(500).send('Internal Server Error');
  }
    
}

couponManagementController.handleEditData = async(req,res)=>{
  const couponId = req.params.id
  const {discountType,discountValue,minimumCartAmount,expiry} = req.body
  
  try{
    const couponData = await coupon.findByIdAndUpdate(couponId, {
            discountType,
            discountValue,
            minimumCartAmount,
            expiry
    })
    res.redirect('/coupon-management')
  }
  catch(err){
    console.error('Error on updating Edit Data:', error);
    res.status(500).send('Internal Server Error');
  }

}


module.exports = couponManagementController