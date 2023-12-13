const orderManagementController = {}
const orders = require('../model/orderSchema')
const wallet = require('../model/walletSchema')
const ITEMS_PER_PAGE = 3;

orderManagementController.showData = async (req,res)=>{
    
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const orderDetails = await orders.find().populate({path:'customer'}).populate({
            path: 'items.product',
            model: 'products',
            select: 'productName image', }).skip(skip).limit(ITEMS_PER_PAGE);
        const totalProducts = await orders.countDocuments();
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        res.render('orderManagement',{orderDetails,currentPage: page, totalPages})

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
}
orderManagementController.updateOrderStatus = async (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.body.order_status;

    console.log("new status ", newStatus)

    try {
        let order = await orders.findById(orderId)
        let userWallet = await wallet.findOne({userId:order.customer})
        if(!userWallet){
            userWallet = new wallet({
                userId:order.customer,
                balance:0,
                transactionHistory:[]
            })
            await userWallet.save();
        }
        console.log("after first if")
        if(newStatus === "Cancelled" || newStatus ==="Returned"){
            const orderAmount = order.totalAmount
            userWallet.balance += orderAmount;
            userWallet.transactionHistory.push({
                transaction: 'Money Added',
                amount: orderAmount,
            });
        }
        const updatedOrder = await orders.findByIdAndUpdate(orderId, { OrderStatus: newStatus }, { new: true });
        await userWallet.save();
        res.redirect('/order-management');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = orderManagementController
