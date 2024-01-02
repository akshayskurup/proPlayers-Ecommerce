const express = require("express")
const userRouter = express.Router()
const checkBlocked = require('../middleware/isBlocked');
const userAuth = require('../middleware/userAuth')
const loginController = require('../controller/loginController')
const signupController = require('../controller/signupController')
const homeController = require('../controller/homeController')
const userProfileController = require('../controller/userProfileController')
const productPageController = require('../controller/productPageController')
const passwordResetController = require('../controller/passwordResetController')
const cartController = require('../controller/cartController')
const checkOutController = require('../controller/checkOutController')
const addAddressController = require('../controller/addAddressController')
const ordersController = require('../controller/ordersController')
const pdfController = require('../controller/pdfController')



userRouter.get('/', loginController.showLoginForm);
userRouter.post('/',userAuth, loginController.handleLogin);

userRouter.get('/signup',signupController.showSignupForm)
userRouter.post('/signup',signupController.handleSignup)

userRouter.get('/signup-otp',signupController.showOTP)
userRouter.post('/signup-otp',signupController.verifyOTP)
userRouter.get('/checkReferral',signupController.checkReferral)
userRouter.post('/resendOtp',signupController.resendOtp)

userRouter.get('/reset-password', passwordResetController.forgotPasswordForm);
userRouter.post('/reset-password/request', passwordResetController.requestPasswordReset);
userRouter.get('/reset-password/verify-otp', passwordResetController.showOTPForm);
userRouter.post('/reset-password/verify-otp', passwordResetController.verifyOTPForPasswordReset);
userRouter.post('/reset-password/resendOtp', passwordResetController.resendOtp)
userRouter.get('/reset-password/new-password', passwordResetController.showPasswordResetForm);
userRouter.post('/reset-password/new-password', passwordResetController.resetPassword);

userRouter.get('/home',checkBlocked,homeController.showHome)
userRouter.post('/home/logout',homeController.logOut)
userRouter.get('/wallet',checkBlocked,homeController.showWallet)
userRouter.get('/products/:category',checkBlocked,homeController.showData)
userRouter.get('/products/:category/sort/:sortDirection', homeController.sortProducts);
userRouter.get('/categoryProducts/:category',checkBlocked,homeController.searchCategoryProducts)
userRouter.get('/allProducts',checkBlocked,homeController.showProducts)
userRouter.get('/searchProducts',homeController.searchProducts)
userRouter.get('/allProducts/high-to-low',homeController.sortHighToLow)
userRouter.get('/allProducts/low-to-high',homeController.sortLowToHigh)



userRouter.get('/user-profile', userProfileController.showUserData)
userRouter.get('/add-address',userProfileController.addAddress)
userRouter.post('/add-address',userProfileController.handleAddAddress)
userRouter.post('/user-edit-address',userProfileController.editAddress)
userRouter.post('/edit-update',userProfileController.UpdateAddress)
userRouter.post('/delete-address',userProfileController.deleteAddress)
userRouter.get('/change-password',userProfileController.showChangePassword)
userRouter.post('/change-password',userProfileController.handleChangePassword)
userRouter.get('/user-edit-profile',userProfileController.showData)
userRouter.post('/user-edit-profile', userProfileController.upload.single("profilePicture"),userProfileController.handleUserData)


userRouter.get('/product-page/:id',checkBlocked,productPageController.showData)
userRouter.post('/product-page/add-to-cart/:id',productPageController.addToCart)

userRouter.get('/cart',checkBlocked,cartController.showCart)
userRouter.post('/cart-item-remove/:id',cartController.removeItem)
userRouter.put('/cart-update-quantity/:productId',cartController.updateQuantity)

userRouter.get('/checkout',checkBlocked,checkOutController.showData)
userRouter.post('/validateCoupon',checkOutController.validateCoupon)
userRouter.post('/cancelCoupon',checkOutController.cancelOrder)
userRouter.post('/checkout',checkOutController.handleData)
userRouter.post('/createOrder',checkOutController.createOrder)
userRouter.post('/verifyPayment',checkOutController.verifyPayment)

userRouter.post('/edit-address',checkOutController.editAddress)
userRouter.post('/updateAddress',checkOutController.UpdateAddresss)
userRouter.get('/order-confirmed',checkBlocked,checkOutController.orderConfirmed )

userRouter.get('/checkOut/addAddress',checkBlocked,addAddressController.showForm)
userRouter.post('/checkOut/addAddress',addAddressController.handleData)

userRouter.get('/orders',checkBlocked,ordersController.showData)
userRouter.post('/orders/:orderId',ordersController.cancelOrder)
userRouter.post('/orders-return/:orderId',ordersController.returnOrder)
userRouter.get('/order-details/:orderId',ordersController.orderDetails)
userRouter.get('/generate-invoice/:orderId',pdfController.generateInvoice);


module.exports=userRouter