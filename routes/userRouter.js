const express = require("express")
const userRouter = express.Router()
const checkBlocked = require('../middleware/isBlocked');
const userAuth = require('../middleware/userAuth')
const loginController = require('../controller/loginController')
const signupController = require('../controller/signupController')
const homeController = require('../controller/homeController')
const userProfileController = require('../controller/userProfileController')
const userEditProfileController = require('../controller/userEditProfileController')
const productPageController = require('../controller/productPageController')
const categoryProductsController = require('../controller/categoryProductsController')
const passwordResetController = require('../controller/passwordResetController')
const cartController = require('../controller/cartController')
const checkOutController = require('../controller/checkOutController')
const addAddressController = require('../controller/addAddressController')
const ordersController = require('../controller/ordersController')
const allProductsController = require('../controller/allProductsController')
const walletManagementController = require('../controller/walletManagementController')




userRouter.get('/', loginController.showLoginForm);
userRouter.post('/',userAuth, loginController.handleLogin);

userRouter.get('/signup',signupController.showSignupForm)
userRouter.post('/signup',signupController.handleSignup)

userRouter.get('/signup-otp',signupController.showOTP)
userRouter.post('/signup-otp',signupController.verifyOTP)
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

userRouter.get('/allProducts',allProductsController.showProducts)
userRouter.get('/searchProducts',allProductsController.searchProducts)
userRouter.get('/products/high-to-low',allProductsController.sortHighToLow)
userRouter.get('/products/low-to-high',allProductsController.sortLowToHigh)

userRouter.get('/user-profile', userProfileController.showUserData)
userRouter.get('/add-address',userProfileController.addAddress)
userRouter.post('/add-address',userProfileController.handleAddAddress)
userRouter.post('/user-edit-address',userProfileController.editAddress)
userRouter.post('/edit-update',userProfileController.UpdateAddress)
userRouter.post('/delete-address',userProfileController.deleteAddress)
userRouter.get('/change-password',userProfileController.showChangePassword)
userRouter.post('/change-password',userProfileController.handleChangePassword)

userRouter.get('/user-edit-profile',userEditProfileController.showData)
userRouter.post('/user-edit-profile', userEditProfileController.upload.single("profilePicture"),userEditProfileController.handleUserData)

userRouter.get('/product-page/:id',checkBlocked,productPageController.showData)
userRouter.post('/product-page/add-to-cart/:id',productPageController.addToCart)

userRouter.get('/products/:category',checkBlocked,categoryProductsController.showData)
userRouter.get('/categoryProducts/:category', categoryProductsController.showData);
// userRouter.get('/products/:category/low-to-high',categoryProductsController.sortLowToHigh)
// userRouter.get('/products/:category/:sort',categoryProductsController.sortHighToLow)
userRouter.get('/products/:category/sort/:sortDirection', categoryProductsController.sortProducts);


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

userRouter.get('/orders',ordersController.showData)
userRouter.post('/orders/:orderId',ordersController.cancelOrder)
userRouter.post('/orders-return/:orderId',ordersController.returnOrder)
userRouter.get('/order-details/:orderId',ordersController.orderDetails)

userRouter.get('/wallet',walletManagementController.showData)

module.exports=userRouter