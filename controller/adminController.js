let adminSchema = require("../model/adminSchema")
let adminController = {}



adminController.showAdminLogin = (req,res)=>{
    if(!req.session.AdminLogin){
        res.render('admin',{message:""})
    }
    else{
        res.redirect('/adminPanel')
    }
    }

adminController.handleAdminLogin = async (req, res) => {
    let { email, password } = req.body;
    const admin = await adminSchema.findOne({ email, password });

    if (!admin) {
        res.render("admin", { message: "No admin with this email" });
    } else if (req.body.password !== admin.password) {
         res.render("admin", { message: "Password is incorrect" });
    }
    req.session.AdminLogin = true;
    console.log('Successfully logged in');
    res.render("adminPanel");
};



module.exports = adminController