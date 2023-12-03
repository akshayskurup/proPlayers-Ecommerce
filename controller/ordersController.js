const ordersController = {}
let orders = require('../model/orderSchema')
let Product = require('../model/productSchema')

ordersController.showData = async (req,res)=>{
    try {
        const userId = req.session.userId;

        // Fetch orders for the logged-in user
        const userOrders = await orders.find({ customer: userId }).populate('items.product');;

        res.render('orders', { userOrders,userId });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).send('Internal Server Error');
    }
}

ordersController.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the order by ID
        const order = await orders.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Check if the order can be canceled (status is 'Shipped' or 'Order Placed')
        if (order.OrderStatus === 'Shipped' || order.OrderStatus === 'Order Placed') {
            // Iterate through the order items and update the product quantities
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;

                // Update the product quantity in the database
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore }
                });
            }

            // Update the order status to 'Cancelled'
            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });

            return res.redirect('/orders');
        } else {
            // Order cannot be canceled (status is 'Delivered', 'Returned', or 'Cancelled')
            return res.status(400).send('Invalid order status for cancellation');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = ordersController