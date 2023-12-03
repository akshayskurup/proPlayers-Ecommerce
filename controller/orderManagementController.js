const orderManagementController = {}
const orders = require('../model/orderSchema')

orderManagementController.showData = async (req,res)=>{
    const orderDetails = await orders.find()
    res.render('orderManagement',{orderDetails})
}
orderManagementController.updateOrderStatus = async (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.body.order_status;

    console.log("new status ", newStatus)

    try {
        const updatedOrder = await orders.findByIdAndUpdate(orderId, { OrderStatus: newStatus }, { new: true });
        res.redirect('/order-management');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = orderManagementController