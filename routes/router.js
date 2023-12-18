const express = require("express")
const router = express.Router()
const checkBlocked = require('../middleware/isBlocked');
const userAuth = require('../middleware/userAuth')
const loginController = require('../controller/loginController')
const signupController = require('../controller/signupController')
const adminController = require('../controller/adminController')
const adminPanelController = require('../controller/adminPanelController')
const homeController = require('../controller/homeController')
const userManagementController = require('../controller/userManagementController')
const userProfileController = require('../controller/userProfileController')
const userEditProfileController = require('../controller/userEditProfileController')
const categoryManagementController = require('../controller/categoryManagementController')
const productManagement = require('../controller/productManagementController')
const editCategoryController = require('../controller/editCategoryController')
const productPageController = require('../controller/productPageController')
const categoryProductsController = require('../controller/categoryProductsController')
const passwordResetController = require('../controller/passwordResetController')
const productManagementController = require("../controller/productManagementController")
const addCategoryController = require('../controller/addCategoryController')
const cartController = require('../controller/cartController')
const checkOutController = require('../controller/checkOutController')
const addAddressController = require('../controller/addAddressController')
const ordersController = require('../controller/ordersController')
const orderManagementController = require('../controller/orderManagementController')
const allProductsController = require('../controller/allProductsController')
const walletManagementController = require('../controller/walletManagementController')
const couponManagementController = require('../controller/couponManagementController')



router.get('/', loginController.showLoginForm);
router.post('/',userAuth, loginController.handleLogin);

router.get('/signup',signupController.showSignupForm)
router.post('/signup',signupController.handleSignup)

router.get('/signup-otp',signupController.showOTP)
router.post('/signup-otp',signupController.verifyOTP)
router.post('/resendOtp',signupController.resendOtp)

router.get('/reset-password', passwordResetController.forgotPasswordForm);
router.post('/reset-password/request', passwordResetController.requestPasswordReset);
router.get('/reset-password/verify-otp', passwordResetController.showOTPForm);
router.post('/reset-password/verify-otp', passwordResetController.verifyOTPForPasswordReset);
router.post('/reset-password/resendOtp', passwordResetController.resendOtp)
router.get('/reset-password/new-password', passwordResetController.showPasswordResetForm);
router.post('/reset-password/new-password', passwordResetController.resetPassword);


router.get('/admin',adminController.showAdminLogin)
router.post('/admin',adminController.handleAdminLogin)

router.get('/adminPanel',adminPanelController.showadminPanel)
router.post('/adminPanel/logout',adminPanelController.logOut)

router.get('/home',checkBlocked,homeController.showHome)
router.get('/search',checkBlocked,homeController.searchProducts)
router.post('/home/logout',homeController.logOut)

router.get('/allProducts',allProductsController.showProducts)
router.get('/searchProducts',allProductsController.searchProducts)
router.get('/products/high-to-low',allProductsController.sortHighToLow)
router.get('/products/low-to-high',allProductsController.sortLowToHigh)

router.get('/user-management',userManagementController.showData)

router.get('/adminPanel/block/:id', userManagementController.blockUser);
router.get('/adminPanel/unblock/:id', userManagementController.unblockUser);

router.get('/user-profile', userProfileController.showUserData)
router.get('/add-address',userProfileController.addAddress)
router.post('/add-address',userProfileController.handleAddAddress)
router.post('/user-edit-address',userProfileController.editAddress)
router.post('/edit-update',userProfileController.UpdateAddress)
router.post('/delete-address',userProfileController.deleteAddress)
router.get('/change-password',userProfileController.showChangePassword)
router.post('/change-password',userProfileController.handleChangePassword)

router.get('/user-edit-profile',userEditProfileController.showData)
router.post('/user-edit-profile', userEditProfileController.upload.single("profilePicture"),userEditProfileController.handleUserData)

router.get('/category-management',categoryManagementController.showData)

router.get('/category-management/add',addCategoryController.showaddForm)
router.post('/category-management/add',addCategoryController.handledata)

router.get('/product-management',productManagement.showData)
router.post('/product-management',productManagement.upload.array('gameImages', 4),productManagement.handleData)
router.get('/product-management/edit/:id',productManagement.showEditForm)
router.get('/search-products',productManagementController.searchProducts)
router.post('/product-management/edit/:id',productManagement.upload.array('gameImages', 4),productManagement.handleEditData)

router.get('/adminPanel/edit/:id',editCategoryController.showEditData)
router.post('/adminPanel/edit/:id',editCategoryController.handleEditData)

router.get('/product-page/:id',checkBlocked,productPageController.showData)
router.post('/product-page/add-to-cart/:id',productPageController.addToCart)

router.get('/products/:category',checkBlocked,categoryProductsController.showData)

router.get('/product-management/toggle-list/:id', productManagementController.toggleListProduct);

router.get('/category-management/toggle-list/:id', categoryManagementController.toggleListCategory);

router.get('/cart',checkBlocked,cartController.showCart)
router.post('/cart-item-remove/:id',cartController.removeItem)
router.put('/cart-update-quantity/:productId',cartController.updateQuantity)

router.get('/checkout',checkBlocked,checkOutController.showData)
router.post('/validateCoupon',checkOutController.validateCoupon)
router.post('/cancelCoupon',checkOutController.cancelOrder)
router.post('/checkout',checkOutController.handleData)
router.post('/createOrder',checkOutController.createOrder)
router.post('/verifyPayment',checkOutController.verifyPayment)

// router.post('/updatingTotal',checkOutController.updateTotal)
router.post('/edit-address',checkOutController.editAddress)
router.post('/updateAddress',checkOutController.UpdateAddresss)
router.get('/order-confirmed',checkBlocked,checkOutController.orderConfirmed )

router.get('/checkOut/addAddress',checkBlocked,addAddressController.showForm)
router.post('/checkOut/addAddress',addAddressController.handleData)

router.get('/orders',ordersController.showData)
router.post('/orders/:orderId',ordersController.cancelOrder)
router.post('/orders-return/:orderId',ordersController.returnOrder)
router.get('/order-details/:orderId',ordersController.orderDetails)

router.get('/order-management',orderManagementController.showData)
router.post('/order-management-update/:orderId',orderManagementController.updateOrderStatus)

router.get('/wallet',walletManagementController.showData)

router.get('/coupon-management',couponManagementController.showData)
router.get('/add-coupon',couponManagementController.addCoupon)
router.post('/add-coupon',couponManagementController.handleCoupon)
router.get('/coupon-management/toggle/:id',couponManagementController.toggleListCategory)
router.get('/coupon-management/edit/:id',couponManagementController.showEditData)
router.post('/edit-coupon/:id',couponManagementController.handleEditData)


module.exports=router