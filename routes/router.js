const express = require("express")
const router = express.Router()
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
const editProductController = require('../controller/editProductController')
const productManagementController = require("../controller/productManagementController")
const addCategoryController = require('../controller/addCategoryController')
const cartController = require('../controller/cartController')
const checkOutController = require('../controller/checkOutController')
const addAddressController = require('../controller/addAddressController')
const ordersController = require('../controller/ordersController')
const orderManagementController = require('../controller/orderManagementController')



router.get('/', loginController.showLoginForm);
router.post('/', loginController.handleLogin);

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

router.get('/home/:id',homeController.showHome)
router.post('/home/logout',homeController.logOut)

router.get('/user-management',userManagementController.showData)

router.get('/adminPanel/block/:id', userManagementController.blockUser);
router.get('/adminPanel/unblock/:id', userManagementController.unblockUser);

router.get('/user-profile/:id', userProfileController.showUserData)

router.get('/user-edit-profile',userEditProfileController.showData)
router.get('/add-address',userProfileController.addAddress )
router.post('/add-address',userProfileController.handleAddAddress)
router.post('/edit-address',userProfileController.editAddress)
router.post('/updateAddress',userProfileController.UpdateAddress)
router.post('/user-edit-profile',userEditProfileController.handleUserData)

router.get('/category-management',categoryManagementController.showData)

router.get('/category-management/add',addCategoryController.showaddForm)
router.post('/category-management/add',addCategoryController.handledata)

router.get('/product-management',productManagement.showData)
router.post('/product-management',productManagement.handleData)

router.get('/adminPanel/edit/:id',editCategoryController.showEditData)
router.post('/adminPanel/edit/:id',editCategoryController.handleEditData)

router.get('/product-page/:id',productPageController.showData)
router.post('/product-page/add-to-cart/:id',productPageController.addToCart)

router.get('/products/:category',categoryProductsController.showData)

router.get('/product-management/edit/:id',editProductController.showForm)
router.post('/product-management/edit/:id',editProductController.handleData)

router.get('/product-management/toggle-list/:id', productManagementController.toggleListProduct);

router.get('/category-management/toggle-list/:id', categoryManagementController.toggleListCategory);

router.get('/cart',cartController.showCart)
router.post('/cart-item-remove/:id',cartController.removeItem)
router.put('/cart-update-quantity/:productId',cartController.updateQuantity)

router.get('/checkout',checkOutController.showData)
router.post('/checkout',checkOutController.handleData)
router.post('/edit-address',checkOutController.editAddress)
router.post('/updateAddress',checkOutController.UpdateAddress)
router.get('/order-confirmed',checkOutController.orderConfirmed )

router.get('/checkOut/addAddress',addAddressController.showForm)
router.post('/checkOut/addAddress',addAddressController.handleData)

router.get('/orders',ordersController.showData)
router.post('/orders/:orderId',ordersController.cancelOrder)

router.get('/order-management',orderManagementController.showData)
router.post('/order-management-update/:orderId',orderManagementController.updateOrderStatus)


module.exports=router