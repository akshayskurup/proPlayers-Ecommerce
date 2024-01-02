const express = require("express")
const adminRouter = express.Router()
const checkBlocked = require('../middleware/isBlocked');
const userAuth = require('../middleware/userAuth')
const adminController = require('../controller/adminController')
const userManagementController = require('../controller/userManagementController')
const categoryManagementController = require('../controller/categoryManagementController')
const productManagement = require('../controller/productManagementController')
// const editCategoryController = require('../controller/editCategoryController')
const couponManagementController = require('../controller/couponManagementController')
const orderManagementController = require('../controller/orderManagementController')
// const addCategoryController = require('../controller/addCategoryController')
const productManagementController = require("../controller/productManagementController")
const offerManagementController = require('../controller/offerManagementController')
const salesReportController = require('../controller/salesReportController')
const bannerController = require('../controller/bannerController')





adminRouter.get('/admin',adminController.showAdminLogin)
adminRouter.post('/admin',adminController.handleAdminLogin)
adminRouter.get('/order-graph-data', adminController.getOrderGraphData);

// adminRouter.get('/admin/getRevenueData', adminController.getDeliveredRevenueData);
adminRouter.get('/admin/getOrderDataByCategory',adminController.getOrderData)
adminRouter.get('/admin/additional-revenue-chart', adminController.getAdditionalRevenueChartData);
adminRouter.get('/sales-report/download/:filter/:selectedValue/pdf', salesReportController.generatePdfReport);

// Add a route for Excel download
adminRouter.get('/sales-report/download/:filter/:selectedValue/excel', salesReportController.generateExcelReport);




adminRouter.get('/adminPanel',adminController.showadminPanel)
adminRouter.post('/adminPanel/logout',adminController.logOut)

adminRouter.get('/user-management',userManagementController.showData)
adminRouter.get('/adminPanel/block/:id', userManagementController.blockUser);
adminRouter.get('/adminPanel/unblock/:id', userManagementController.unblockUser);

adminRouter.get('/category-management',categoryManagementController.showData)
adminRouter.get('/category-management/toggle-list/:id', categoryManagementController.toggleListCategory);
adminRouter.get('/category-management/add',categoryManagementController.showaddForm)
adminRouter.post('/category-management/add',categoryManagementController.handledata)
adminRouter.get('/adminPanel/edit/:id',categoryManagementController.showEditData)
adminRouter.post('/adminPanel/edit/:id',categoryManagementController.handleEditData)


adminRouter.get('/product-management',productManagement.showData)
adminRouter.post('/product-management',productManagement.upload.array('gameImages', 4),productManagement.handleData)
adminRouter.get('/product-management/edit/:id',productManagement.showEditForm)
adminRouter.get('/search-products',productManagementController.searchProducts)
adminRouter.post('/product-management/edit/:id', productManagement.upload.fields([
    { name: 'gameImages1', maxCount: 1 },
    { name: 'gameImages2', maxCount: 1 },
    { name: 'gameImages3', maxCount: 1 },
    { name: 'gameImages4', maxCount: 1 },
  ]),productManagement.handleEditData);
adminRouter.post('/remove-image',productManagement.removeImage)
adminRouter.get('/product-management/toggle-list/:id', productManagementController.toggleListProduct);




adminRouter.get('/order-management',orderManagementController.showData)
adminRouter.post('/order-management-update/:orderId',orderManagementController.updateOrderStatus)

adminRouter.get('/coupon-management',couponManagementController.showData)
adminRouter.get('/add-coupon',couponManagementController.addCoupon)
adminRouter.post('/add-coupon',couponManagementController.handleCoupon)
adminRouter.get('/coupon-management/toggle/:id',couponManagementController.toggleListCategory)
adminRouter.get('/coupon-management/edit/:id',couponManagementController.showEditData)
adminRouter.post('/edit-coupon/:id',couponManagementController.handleEditData)

adminRouter.get('/offer-management',offerManagementController.showOffers)
adminRouter.get('/check-and-expire-offers',offerManagementController.checkAndExpireOffers)
adminRouter.get('/add-offer',offerManagementController.showAddOffer)
adminRouter.post('/add-offer',offerManagementController.handleData)
adminRouter.get('/offer-management/toggle/:offerId',offerManagementController.toggleListOffer)
adminRouter.get('/offer-management/edit/:offerId',offerManagementController.editOffer)
adminRouter.post('/edit-offer/:offerId',offerManagementController.handleEditOffer)

adminRouter.get('/banner-management',bannerController.showBanners)
adminRouter.get('/banner-management/toggle/:bannerId',bannerController.toggle)
adminRouter.get('/banner-management/edit/:bannerId',bannerController.showBannerEdit)
adminRouter.post('/edit-banner/:bannerId',bannerController.upload,bannerController.handleBannerEdit)
adminRouter.get('/add-banner',bannerController.addBanner)
adminRouter.post('/add-banner',bannerController.upload,bannerController.handleData)

module.exports=adminRouter