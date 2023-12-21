const ordersController = {}
let orders = require('../model/orderSchema')
let Product = require('../model/productSchema')
let category = require('../model/categorySchema')
let User = require('../model/userSchema')
let wallet = require('../model/walletSchema')
const pdfController = require('./pdfController');
const { createInvoice } = require('../controller/pdfController');
const path = require('path');
const fs = require('fs');

const ITEMS_PER_PAGE = 7;
ordersController.showData = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const categories = await category.find()
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const totalOrdersCount = await orders.countDocuments({ customer: userId });

        const userOrders = await orders.find({ customer: userId }).populate('items.product').skip(skip).limit(ITEMS_PER_PAGE);
        const totalPages = Math.ceil(totalOrdersCount / ITEMS_PER_PAGE);

        res.render('orders', { userOrders,userId,categories,currentPage: page, totalPages });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).send('Internal Server Error');
    }
}

// ordersController.cancelOrder = async (req, res) => {
//     try {
//         const orderId = req.params.orderId;
        

//         // Find the order by ID
//         const order = await orders.findById(orderId);
//         if (!order) {
//             return res.status(404).send('Order not found');
//         }
//         let userWallet = await wallet.findOne({userId:order.customer})
//         if(!userWallet){
//             userWallet = new wallet({
//                 userId:order.customer,
//                 balance:0,
//                 transactionHistory:[]
//             })
//             await userWallet.save();

//         }
//         if (order.paymentMethod === 'Wallet'|| order.paymentMethod ==='onlinePayment') {
//             const orderAmount = order.totalAmount
//             userWallet.balance += orderAmount;
//             userWallet.transactionHistory.push({
//                 transaction: 'Money Added',
//                 amount: orderAmount,
//             });
//             for (const item of order.items) {
//                 const productId = item.product._id;
//                 const quantityToRestore = item.quantity;
//                 await Product.findByIdAndUpdate(productId, {
//                     $inc: { totalQuantity: quantityToRestore }
//                 });
//             }
//             await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
//             await userWallet.save();

//             return res.redirect('/orders');
//         } else {
//             for (const item of order.items) {
//                 const productId = item.product._id;
//                 const quantityToRestore = item.quantity;
//                 await Product.findByIdAndUpdate(productId, {
//                     $inc: { totalQuantity: quantityToRestore }
//                 });
//             }
//             await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
//             await userWallet.save();

//             return res.json({ success: true});

//         }
//     } catch (error) {
//         console.error('Error cancelling order:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };



ordersController.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        let userWallet = await wallet.findOne({ userId: order.customer });
        if (!userWallet) {
            userWallet = new wallet({
                userId: order.customer,
                balance: 0,
                transactionHistory: [],
            });
            await userWallet.save();
        }

        if (order.paymentMethod === 'Wallet' || order.paymentMethod === 'onlinePayment') {
            const orderAmount = order.totalAmount;
            userWallet.balance += orderAmount;
            userWallet.transactionHistory.push({
                transaction: 'Money Added',
                amount: orderAmount,
            });

            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore },
                });
            }

            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
            await userWallet.save();

            return res.json({ success: true, message: 'Order cancelled successfully' });
        } else {
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore },
                });
            }

            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Cancelled' });
            await userWallet.save();

            return res.json({ success: true, message: 'Order cancelled successfully' });
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


ordersController.returnOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        

        const order = await orders.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        let userWallet = await wallet.findOne({userId:order.customer})
        if(!userWallet){
            userWallet = new wallet({
                userId:order.customer,
                balance:0,
                transactionHistory:[]
            })
            await userWallet.save();

        }
        if (order.OrderStatus === 'Delivered') {
            const orderAmount = order.totalAmount
            userWallet.balance += orderAmount;
            userWallet.transactionHistory.push({
                transaction: 'Money Added',
                amount: orderAmount,
            });
            for (const item of order.items) {
                const productId = item.product._id;
                const quantityToRestore = item.quantity;
                await Product.findByIdAndUpdate(productId, {
                    $inc: { totalQuantity: quantityToRestore }
                });
            }
            await orders.findByIdAndUpdate(orderId, { OrderStatus: 'Returned' });
            await userWallet.save();

            return res.json({success:true})
        } else {
            return res.status(400).send('Invalid order status for return');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

ordersController.orderDetails = async (req,res)=>{
    try {
        const userId = req.session.userId;
        const categories = await category.find()
        const orderId = req.params.orderId
        const orderDetails = await orders.findOne({ _id: orderId }).populate('items.product');
        const customer = await User.findById(userId)
        res.render('orderDetails', { orderDetails,userId,categories,customer });

    } catch (error) {
        
    }
    
}



ordersController.generatePdf = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      // Get the absolute path to the project directory
      const projectDir = path.resolve(__dirname, '..'); // Assuming "controller" is one level above
  
      // Generate PDF with order details
      const pdfFileName = `invoice_${Date.now()}.pdf`;
      const pdfPath = path.join(projectDir, 'public', 'invoices', pdfFileName);
  
      // Generate the PDF and get the file path
      const generatedPath = await pdfController.generateInvoice(orderId, pdfPath, res);

  
      // Wait for the PDF generation to complete before sending the download response
     
      res.download(generatedPath, 'invoice.pdf', (downloadErr) => {
        // Remove the PDF file after the download is completed or if there's an error
        console.log('Removing PDF file:', generatedPath);
        // Uncomment the next line if you want to remove the file after download
        // fs.unlinkSync(generatedPath);
  
        if (downloadErr) {
          console.error(downloadErr);
          res.status(500).send('Download Failed');
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
  







module.exports = ordersController