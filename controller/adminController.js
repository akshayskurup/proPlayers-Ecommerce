let adminSchema = require("../model/adminSchema")
const Order = require("../model/orderSchema");
const coupon = require("../model/couponSchema")
const offer = require("../model/offerSchema")
const { ObjectId } = require('mongodb');


let adminController = {}



adminController.showAdminLogin = (req,res)=>{
    if(!req.session.AdminLogin){
        res.render('Admin/admin',{message:""})
    }
    else{
        res.redirect('/adminPanel')
        
    }
    }

adminController.handleAdminLogin = async (req, res) => {
    let { email, password } = req.body;
    let deliveredOrder = await Order.find({OrderStatus:"Delivered"}).countDocuments()
    const orderCount = await Order.countDocuments();
    const activeCoupon = await coupon.find({isActive:true}).countDocuments()
    const activeOffer = await offer.find({isActive:true}).countDocuments()


    try {
        const admin = await adminSchema.findOne({ email, password });

        if (!admin) {
            res.render("Admin/admin", { message: "No admin with this email" });
        } else if (req.body.password !== admin.password) {
             res.render("Admin/admin", { message: "Password is incorrect" });
        }
        req.session.AdminLogin = true;
        console.log('Successfully logged in');
        res.render("Admin/adminPanel",{orderCount,deliveredOrder,activeCoupon,activeOffer});
    } catch (error) {
        console.log("Error",error)
        res.status(500).send({ error: "Internal Server Error" });

    }
   
   
};

adminController.showadminPanel=async(req,res)=>{
    let deliveredOrder = await Order.find({OrderStatus:"Delivered"}).countDocuments()
    const orderCount = await Order.countDocuments();
    const activeCoupon = await coupon.find({isActive:true}).countDocuments()
    const activeOffer = await offer.find({isActive:true}).countDocuments()

    try {
        if(req.session.AdminLogin){
            res.render("Admin/adminPanel",{deliveredOrder,orderCount,activeCoupon,activeOffer})
        }
        else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log("Error",error)
        res.status(500).send({ error: "Internal Server Error" });

    }
    
}



adminController.logOut = (req,res)=>{
    req.session.AdminLogin=false
    console.log("Successfully LogOut from admin")
    res.redirect('/admin')
}



adminController.getOrderGraphData = async (req, res) => {
    try {
        const orderGraphData = await Order.aggregate([
            { $match: { OrderStatus: 'Delivered' } }, 
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        const sortedOrderGraphData = orderGraphData.sort((a, b) => {
            const aId = a._id || '';
            const bId = b._id || '';
            return aId.localeCompare(bId);
        });

        res.json(sortedOrderGraphData);
    } catch (error) {
        console.error("Error fetching order graph data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



adminController.getDeliveredRevenueData = async (req, res) => {
    try {
        const weeklyRevenueData = await Order.aggregate([
            { $match: { OrderStatus: 'Delivered' } }, 
            {
                $group: {
                    _id: { $week: "$orderDate" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        const monthlyRevenueData = await Order.aggregate([
            { $match: { OrderStatus: 'Delivered' } },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        
        const yearlyRevenueData = await Order.aggregate([
            { $match: { OrderStatus: 'Delivered' } }, 
            {
                $group: {
                    _id: { $year: "$orderDate" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        res.json({ weekly: weeklyRevenueData, monthly: monthlyRevenueData, yearly: yearlyRevenueData });
    } catch (error) {
        console.error("Error fetching delivered revenue data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


adminController.getOrderData = async (req, res) => {
    try {
        const orders = await Order.find({
            OrderStatus: 'Delivered' 
        }).populate({
            path: 'items.product',
            populate: {
                path: 'productCategory',
                model: 'categories'
            }
        });

        const categoryData = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const categoryName = item.product.productCategory.categoryName;

                if (categoryData[categoryName]) {
                    categoryData[categoryName]++;
                } else {
                    categoryData[categoryName] = 1;
                }
            });
        });

        const doughnutChartData = Object.entries(categoryData).map(([categoryName, orderCount]) => ({
            categoryName,
            orderCount
        }));

        res.json(doughnutChartData);
    } catch (error) {
        console.error("Error fetching order data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
adminController.getAdditionalRevenueChartData = async (req, res) => {
    try {
        const { filter } = req.query; 

        let aggregateOptions = [];

        if (filter === 'weekly') {
            aggregateOptions = [
                { $match: { OrderStatus: 'Delivered' } },
                { $group: { _id: { $week: "$orderDate" }, totalRevenue: { $sum: "$totalAmount" } } }
            ];
            
        } else if (filter === 'monthly') {
            aggregateOptions = [
                { $match: { OrderStatus: 'Delivered' } },
                { $group: { _id: { $month: "$orderDate" }, totalRevenue: { $sum: "$totalAmount" } } }
            ];
        } else if (filter === 'yearly') {
            aggregateOptions = [
                { $match: { OrderStatus: 'Delivered' } },
                { $group: { _id: { $year: "$orderDate" }, totalRevenue: { $sum: "$totalAmount" } } }
            ];
        } else if (filter === 'daily') {
            aggregateOptions = [
                { $match: { OrderStatus: 'Delivered' } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } }, totalRevenue: { $sum: '$totalAmount' } } }
            ];
        }else {
            return res.status(400).json({ error: "Invalid filter parameter" });
        }

        const additionalRevenueData = await Order.aggregate(aggregateOptions);
        console.log("additionalRevenueData",additionalRevenueData)


        res.json(additionalRevenueData);
    } catch (error) {
        console.error("Error fetching additional revenue data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = adminController