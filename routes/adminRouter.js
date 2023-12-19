const express = require("express")
const adminRouter = express.Router()
const checkBlocked = require('../middleware/isBlocked');
const userAuth = require('../middleware/userAuth')
const adminController = require('../controller/adminController')
const adminPanelController = require('../controller/adminPanelController')
const userManagementController = require('../controller/userManagementController')
const categoryManagementController = require('../controller/categoryManagementController')
const productManagement = require('../controller/productManagementController')
const editCategoryController = require('../controller/editCategoryController')
const couponManagementController = require('../controller/couponManagementController')
const orderManagementController = require('../controller/orderManagementController')
const addCategoryController = require('../controller/addCategoryController')
const productManagementController = require("../controller/productManagementController")





adminRouter.get('/admin',adminController.showAdminLogin)
adminRouter.post('/admin',adminController.handleAdminLogin)

adminRouter.get('/adminPanel',adminPanelController.showadminPanel)
adminRouter.post('/adminPanel/logout',adminPanelController.logOut)

adminRouter.get('/user-management',userManagementController.showData)
adminRouter.get('/adminPanel/block/:id', userManagementController.blockUser);
adminRouter.get('/adminPanel/unblock/:id', userManagementController.unblockUser);

adminRouter.get('/category-management',categoryManagementController.showData)
adminRouter.get('/category-management/toggle-list/:id', categoryManagementController.toggleListCategory);

adminRouter.get('/product-management',productManagement.showData)
adminRouter.post('/product-management',productManagement.upload.array('gameImages', 4),productManagement.handleData)
adminRouter.get('/product-management/edit/:id',productManagement.showEditForm)
adminRouter.get('/search-products',productManagementController.searchProducts)
adminRouter.post('/product-management/edit/:id',productManagement.upload.array('gameImages', 4),productManagement.handleEditData)
adminRouter.get('/product-management/toggle-list/:id', productManagementController.toggleListProduct);

adminRouter.get('/adminPanel/edit/:id',editCategoryController.showEditData)
adminRouter.post('/adminPanel/edit/:id',editCategoryController.handleEditData)

adminRouter.get('/category-management/add',addCategoryController.showaddForm)
adminRouter.post('/category-management/add',addCategoryController.handledata)

adminRouter.get('/order-management',orderManagementController.showData)
adminRouter.post('/order-management-update/:orderId',orderManagementController.updateOrderStatus)

adminRouter.get('/coupon-management',couponManagementController.showData)
adminRouter.get('/add-coupon',couponManagementController.addCoupon)
adminRouter.post('/add-coupon',couponManagementController.handleCoupon)
adminRouter.get('/coupon-management/toggle/:id',couponManagementController.toggleListCategory)
adminRouter.get('/coupon-management/edit/:id',couponManagementController.showEditData)
adminRouter.post('/edit-coupon/:id',couponManagementController.handleEditData)

module.exports=adminRouter