const checkOutController = {}
let User = require("../model/userSchema");
let cart = require("../model/cartSchema")
let cartController = require("../controller/cartController")
let Order = require('../model/orderSchema')




checkOutController.showData = async (req, res) => {
    const userId = req.session.userId;
    console.log("user id:", userId);

    try {
        // Fetch user data
        const user = await User.findById(userId);

        // Fetch user's cart data
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const items = userCart.items;
        console.log("caart items",items)

        // Calculate total price from the cart
        const totalPrice = cartController.calculateTotalPrice(items);

        // Fetch user addresses
        const userAddresses = user.address;

        // Render the checkout page with user data, addresses, and total price
        res.render("checkOutPage", { user, userAddresses, totalPrice,items });

    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
};


checkOutController.editAddress = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex } = req.body;
    console.log("addressIndex",addressIndex)

    // Retrieve the user's data and the specific address to edit using the index
    try {
        const user = await User.findById(userId);
        const userAddressToEdit = user.address[addressIndex];
        res.render('editAddress', { user, userAddressToEdit, addressIndex });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
};
checkOutController.UpdateAddress = async (req, res) => {
    const userId = req.session.userId;
    const { addressIndex,mobile, houseName, street, city, pincode, state } = req.body;
    console.log("addressIndex",addressIndex)

    // Update the specific address in the user's array
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    [`address.${addressIndex}.mobile`]: mobile,
                    [`address.${addressIndex}.houseName`]: houseName,
                    [`address.${addressIndex}.street`]: street,
                    [`address.${addressIndex}.city`]: city,
                    [`address.${addressIndex}.pincode`]: pincode,
                    [`address.${addressIndex}.state`]: state
                    
                },
            },
            { new: true }
        );

        // Redirect to the user profile or another appropriate page
        res.redirect("/checkOut");
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Internal Server Error');
    }
}

checkOutController.handleData = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { selectedAddress, paymentMethod } = req.body;
        console.log("Address",selectedAddress)

        // Fetch user's cart data
        const userCart = await cart.findOne({ userId }).populate('items.productId');
        const items = userCart.items;

        // Calculate total price from the cart
        const totalPrice = cartController.calculateTotalPrice(items);

        // Create a new order instance
        const newOrder = new Order({
            customer: userId,
            addressIndex: selectedAddress,
            items: items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity
            })),
            totalAmount: totalPrice,
            OrderStatus: 'Order Placed',  // You might adjust this based on your business logic
            paymentMethod: paymentMethod,
            orderId: generateOrderId(),  // You need to implement a function to generate a unique order ID
        });

        // Save the new order to the database
        await newOrder.save();

        // You may want to clear the user's cart or perform other actions here

        // Redirect to a thank you or confirmation page
        res.redirect("/order-confirmed");
    } catch (err) {
        console.error('Error handling checkout data:', err);
        res.status(500).send('Internal Server Error');
    }
}

// You need to implement a function to generate a unique order ID
function generateOrderId() {
    // Implement your logic to generate a unique order ID
    // For example, you can use a combination of timestamp and a random number
    return Date.now().toString() + Math.floor(Math.random() * 1000);
}

module.exports = checkOutController


