const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  addressIndex:{
    type:Number,
    default:0
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
      },
      quantity:{
        type:Number
      }
    }
  ],
  totalAmount: Number,
  OrderStatus:{
    type:String,
    enum:['Order Placed','Shipped','Delivered','Cancelled','Returned']
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  },
  paymentMethod: String,
  orderId:String
});

const order = mongoose.model('orders', orderSchema);

module.exports = order;
