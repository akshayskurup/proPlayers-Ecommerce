let bannerController = {}
const banner = require('../model/bannerSchema')
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'D:/First Project/public/bannerimgs/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); 
    },
});
bannerController.upload = multer({ storage: storage }).single('image');

bannerController.showBanners = async(req,res)=>{
    const updateMessage = req.query.successMessage || ""
    const banners = await banner.find()
    try {
        res.render('Admin/bannerManagement',{banners,updateMessage})
    } catch (error) {
        console.errror("Error displaying the banner", error)
        res.status(500).send("internal server error")
    }
}

bannerController.addBanner = (req,res)=>{
    try {
        res.render('Admin/addBanner')
    } catch (error) {
        console.error('Error displaying add-banner :', error);
      res.status(500).send('Internal Server Error');
    }
}

bannerController.handleData = async(req,res)=>{
    try {
        const {link,title} = req.body
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const imagePath = req.file.path;

        const relativePath = require('path').normalize(imagePath).replace(/\\/g, '/').replace('D:/First Project/public', '');

        console.log("imagePAth",relativePath)

            const newBanner = new banner({
                image: relativePath,
                redirectLink: link,
                title:title
            });
            await newBanner.save()
            res.redirect('/product-management?successMessage=Banner Added successfully')
    } catch (error) {
        console.error('Error handling data:', error);
            res.status(500).send('Internal Server Error');
    }
}

bannerController.toggle = async(req,res)=>{
    const bannerId = req.params.bannerId
    const Banner = await banner.findById(bannerId)
    try {
        if(Banner){
            Banner.isActive = !Banner.isActive
            await Banner.save()
            res.redirect('/banner-management')
        }
    } catch (error) {
        console.error('Error toggling data:', error);
        res.status(500).send('Internal Server Error');
    }
}

bannerController.showBannerEdit = async(req,res)=>{
    const bannerId = req.params.bannerId
    const Banner = await banner.findById(bannerId)
    try {
        if(banner){
          res.render("Admin/editBanner",{Banner})  
        }
        
    } catch (error) {
        console.error('Error showing edit data:', error);
        res.status(500).send('Internal Server Error');
    }
}

bannerController.handleBannerEdit = async (req, res) => {
    const {title,link} = req.body;
    const bannerId = req.params.bannerId;
    console.log("Req body",req.body.title)

    try {
        const Banner = await banner.findById(bannerId);

        if (!Banner) {
            return res.status(404).send('Banner not found');
        }

        if (req.file) {
            if (Banner.image) {
                try {
                    const oldImagePath = './public' + Banner.image;
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }

            Banner.image = '/bannerimgs/' + req.file.filename;
        }

        Banner.title = title;
        Banner.redirectLink = link;

        await Banner.save();

        res.redirect('/banner-management?successMessage=Banner Edited successfully')
    } catch (error) {
        console.error('Error editing banner:', error);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = bannerController