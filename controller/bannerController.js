
let bannerController = {};
const banner = require('../model/bannerSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine the server path dynamically using __dirname
        const serverPath = path.resolve(__dirname, '..'); // Adjust the number of '..' based on your project structure

        // Construct the destination path relative to the server path including 'public'
        const destinationPath = path.join(serverPath, 'public', 'bannerimgs');

        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

bannerController.upload = multer({ storage: storage }).single('image');

bannerController.showBanners = async (req, res) => {
    const updateMessage = req.query.successMessage || '';
    const banners = await banner.find();
    try {
        res.render('Admin/bannerManagement', { banners, updateMessage });
    } catch (error) {
        console.error('Error displaying the banner', error);
        res.status(500).send('Internal Server Error');
    }
};

bannerController.addBanner = (req, res) => {
    try {
        res.render('Admin/addBanner');
    } catch (error) {
        console.error('Error displaying add-banner :', error);
        res.status(500).send('Internal Server Error');
    }
};

bannerController.handleData = async (req, res) => {
    try {
        const { link, title } = req.body;
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const imagePath = req.file.path;

        // Determine the server path dynamically using __dirname
        const serverPath = path.resolve(__dirname, '..'); // Adjust the number of '..' based on your project structure

        // Construct the relative path excluding 'public'
        const relativePath = path.relative(path.join(serverPath, 'public'), imagePath).replace(/\\/g, '/');

        const newBanner = new banner({
            image: relativePath,
            redirectLink: link,
            title: title,
        });
        await newBanner.save();
        res.redirect('/product-management?successMessage=Banner Added successfully');
    } catch (error) {
        console.error('Error handling data:', error);
        res.status(500).send('Internal Server Error');
    }
};

bannerController.toggle = async (req, res) => {
    const bannerId = req.params.bannerId;
    const Banner = await banner.findById(bannerId);
    try {
        if (Banner) {
            Banner.isActive = !Banner.isActive;
            await Banner.save();
            res.redirect('/banner-management');
        }
    } catch (error) {
        console.error('Error toggling data:', error);
        res.status(500).send('Internal Server Error');
    }
};

bannerController.showBannerEdit = async (req, res) => {
    const bannerId = req.params.bannerId;
    const Banner = await banner.findById(bannerId);
    try {
        if (Banner) {
            res.render('Admin/editBanner', { Banner });
        }
    } catch (error) {
        console.error('Error showing edit data:', error);
        res.status(500).send('Internal Server Error');
    }
};

bannerController.handleBannerEdit = async (req, res) => {
    const { title, link } = req.body;
    const bannerId = req.params.bannerId;

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

        res.redirect('/banner-management?successMessage=Banner Edited successfully');
    } catch (error) {
        console.error('Error editing banner:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = bannerController;
