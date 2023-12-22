const offerManagementController = {}
const productSchema = require('../model/productSchema')
const categorySchema= require('../model/categorySchema')
const offerSchema = require('../model/offerSchema')
const mongoose = require('mongoose')

offerManagementController.showOffers = async (req,res)=>{
    const allOffers = await offerSchema.find().populate('selectedCategory').populate('selectedProducts')
    try {
        res.render('offerManagement',{allOffers})
    } catch (error) {
        console.error("Error during coupon showing:", error);
    res.status(500).send('Internal Server Error');
}
    
}

offerManagementController.showAddOffer = async (req,res)=>{
    const products = await productSchema.find()
    const categories = await categorySchema.find()
    res.render('addOffer',{products,categories,message:""})
}

offerManagementController.handleData =async (req,res)=>{
    const products = await productSchema.find()
    const Offer = await offerSchema.find()
    const categories = await categorySchema.find()

    console.log("inside handle data")
const {
    offerName,
    discountOn,
    discountValue,
    startDate,
    endDate,
    selectedCategory,
    selectedProducts
}=req.body
try {
    const existingNameOffer = await offerSchema.findOne({ offerName });
    const existingCategoryOffer = await offerSchema.findOne({ selectedCategory });
    const existingProductOffer = await offerSchema.findOne({ selectedProducts });


    if (existingNameOffer) {
        return res.render("addOffer", {
            products,
            categories,
          message: "Duplicate Discount Name not allowed.",
        });
      }
  
      if (selectedCategory && existingCategoryOffer) {
        return res.render("addOffer", {
          products,
          categories,
          message: "An offer for this category already exists.",
        });
      }
  
      if (selectedProducts && existingProductOffer) {
        return res.render("addOffer", {
            products,
            categories,
          message: "An offer for this product already exists.",
        });
      }
    let modifiedSelectedCategory = selectedCategory;
    let modifiedSelectedProducts = selectedProducts;

    if (discountOn === 'category') {
        modifiedSelectedProducts = null;
        const selectedCategoryObjectId = new mongoose.Types.ObjectId(selectedCategory);
        modifiedSelectedCategory = selectedCategoryObjectId;
        await productSchema.updateMany(
            { productCategory: modifiedSelectedCategory },
            { $set: { discount: discountValue} }
        );
        const productsInCategory = await productSchema.find({ productCategory: modifiedSelectedCategory });
            for (const product of productsInCategory) {
                product.originalPrice = product.price
                const discountedPrice = product.price - (product.price * discountValue / 100);
                product.price = discountedPrice;
                await product.save();
            }
    } else if (discountOn === 'product') {
        modifiedSelectedCategory = null;
        modifiedSelectedProducts = selectedProducts;
        const product = await productSchema.findOne({_id:modifiedSelectedProducts});
            if (product) {
                const discountedPrice = product.price - (product.price * discountValue) / 100;
                console.log("inside for 2")
                product.originalPrice = product.price
                product.discount = discountValue;
                product.price = discountedPrice;
        
                // Save the updated product
                await product.save();
                console.log("After save")
            }
        
        
    }
    console.log("before new")

    const newOffer = new offerSchema({
        offerName,
        discountOn,
        discountValue,
        startDate,
        endDate,
        selectedCategory: modifiedSelectedCategory,
        selectedProducts: modifiedSelectedProducts,
    });

    console.log("Save before")
    const savedOffer = await newOffer.save()
    res.redirect('/offer-management')

} catch (error) {
    console.error("Error during coupon creation:", error);
    res.status(500).send('Internal Server Error');
}
}

// offerManagementController.toggleListOffer = async (req,res)=>{
//     const offerId = req.params.offerId
//     try {
//         const allOffers = await offerSchema.findOne({_id:offerId})
//         if(allOffers){
//             if (allOffers.discountOn === 'category' && allOffers.selectedCategory) {
//                 const categoryId = allOffers.selectedCategory;
//                 let products = await productSchema.find({productCategory:categoryId});
//                  // Iterate through each product and update the prices
//                  for (const product of products) {
//                     product.price = product.originalPrice;
//                     product.originalPrice = 0;
                    
//                     await product.save();
//                 }
//             }
//         } 
//             if(allOffers.isActive){
//                 allOffers.originalPrice = allOffers.price;
//                 allOffers.price = 0;
//             }
//             allOffers.isActive = !allOffers.isActive
//             await allOffers.save()
//             res.redirect('/offer-management')
        
       

//     } catch (error) {
//         console.error('Error toggling offer  status:', error);
//         res.status(500).send('Internal Server Error');
//     }
// }


offerManagementController.toggleListOffer = async (req, res) => {
    const offerId = req.params.offerId;
    try {
        const offer = await offerSchema.findOne({ _id: offerId });
        if (offer) {
            if (offer.discountOn === 'category' && offer.selectedCategory) {
                const categoryId = offer.selectedCategory;
                const products = await productSchema.find({ productCategory: categoryId });

                // Iterate through each product and update the prices
                for (const product of products) {
                    if (offer.isActive) {
                        // Deactivate: Revert the product price to the original price
                        product.price = product.originalPrice;
                        product.originalPrice = 0;

                        // Restore the original discount value
                        product.discount = 0; // Set to zero as discount is being deactivated
                    } else {
                        // Activate: Store the original price and apply the discount
                        product.originalPrice = product.price;
                        const discountedPrice = product.price - (product.price * offer.discountValue) / 100;
                        product.price = discountedPrice;

                        // Store the original discount value
                        product.discount = offer.discountValue;
                    }
                    await product.save();
                }
            } else if (offer.discountOn === 'product' && offer.selectedProducts) {
                const productId = offer.selectedProducts;
                const product = await productSchema.findOne({ _id: productId });

                if (offer.isActive) {
                    // Deactivate: Revert the product price to the original price
                    product.price = product.originalPrice;
                    product.originalPrice = 0;

                    // Restore the original discount value
                    product.discount = 0; // Set to zero as discount is being deactivated
                } else {
                    // Activate: Store the original price and apply the discount
                    product.originalPrice = product.price;
                    const discountedPrice = product.price - (product.price * offer.discountValue) / 100;
                    product.price = discountedPrice;

                    // Store the original discount value
                    product.discount = offer.discountValue;
                }
                await product.save();
            }

            // Update offer status
            offer.isActive = !offer.isActive;
            await offer.save();

            res.redirect('/offer-management');
        } else {
            res.status(404).send('Offer not found');
        }
    } catch (error) {
        console.error('Error toggling offer status:', error);
        res.status(500).send('Internal Server Error');
    }
};






offerManagementController.editOffer = async (req,res)=>{
    const offerId = req.params.offerId
    const products = await productSchema.find()
    const categories = await categorySchema.find()
    try {

        const offers = await offerSchema.findOne({_id:offerId})
        const formattedStartDate = offers.startDate.toISOString().split('T')[0];
        const formattedEndDate = offers.endDate.toISOString().split('T')[0];


        res.render("editOffer",{offers,categories,products,formattedStartDate,formattedEndDate,message:""})
    } catch (error) {
        
    }
}
offerManagementController.handleEditOffer = async (req, res) => {
    const offerId = req.params.offerId;
    console.log("offerId inside edit", offerId);

    const {
        offerName,
        discountOn,
        discountValue,
        startDate,
        endDate,
        selectedCategory,
        selectedProducts
    } = req.body;

    try {
        const offers = await offerSchema.findOne({ _id: offerId });
        const products = await productSchema.find();
        const categories = await categorySchema.find();

        const formattedStartDate = offers.startDate.toISOString().split('T')[0];
        const formattedEndDate = offers.endDate.toISOString().split('T')[0];

        // Skip name validation if the offer name remains unchanged
        if (offerName !== offers.offerName) {
            const existingNameOffer = await offerSchema.findOne({ offerName });
            if (existingNameOffer) {
                return res.render("editOffer", {
                    offers,
                    formattedStartDate,
                    formattedEndDate,
                    products,
                    categories,
                    message: "Duplicate Discount Name not allowed.",
                });
            }
        }

        let modifiedSelectedCategory = selectedCategory;
        let modifiedSelectedProducts = selectedProducts;

        if (discountOn === 'category') {
            // Check uniqueness for selectedCategory only if it has changed
            if (selectedCategory !== offers.selectedCategory) {
                const existingCategoryOffer = await offerSchema.findOne({ selectedCategory });
                if (existingCategoryOffer) {
                    return res.render("editOffer", {
                        offers,
                        formattedStartDate,
                        formattedEndDate,
                        products,
                        categories,
                        message: "An offer for this category already exists.",
                    });
                }
            }

            modifiedSelectedProducts = null;
            const selectedCategoryObjectId = new mongoose.Types.ObjectId(selectedCategory);
            modifiedSelectedCategory = selectedCategoryObjectId;
        } else if (discountOn === 'product') {
            modifiedSelectedCategory = null;
            modifiedSelectedProducts = selectedProducts;

            // Check uniqueness for selectedProducts only if it has changed
            if (selectedProducts !== offers.selectedProducts) {
                const existingProductOffer = await offerSchema.findOne({
                    selectedProducts,
                    _id: { $ne: offerId } // Exclude the current offer
                });
                if (existingProductOffer) {
                    return res.render("editOffer", {
                        offers,
                        formattedStartDate,
                        formattedEndDate,
                        products,
                        categories,
                        message: "An offer for this product already exists.",
                    });
                }
            }

            const product = await productSchema.findOne({ _id: modifiedSelectedProducts });
            if (product) {
                const discountedPrice = product.price - (product.price * discountValue) / 100;
                console.log("inside for 2");
                product.originalPrice = product.price;
                product.discount = discountValue;
                product.price = discountedPrice;

                await product.save();
                console.log("After save");
            }
        }

        const updatedOffer = await offerSchema.findByIdAndUpdate(offerId, {
            offerName,
            discountOn,
            discountValue,
            startDate,
            endDate,
            selectedCategory: modifiedSelectedCategory,
            selectedProducts: modifiedSelectedProducts,
        });

        console.log("Save before");
        res.redirect('/offer-management');

    } catch (error) {
        console.error("Error during coupon creation:", error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = offerManagementController