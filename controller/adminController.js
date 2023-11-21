let adminSchema = require("../model/adminSchema")
let adminController = {}



adminController.showAdminLogin = (req,res)=>{
    res.render('admin',{message:""})
}

adminController.handleAdminLogin = async (req, res) => {
    let { email, password } = req.body;
    const admin = await adminSchema.findOne({ email, password });

    if (!admin) {
        res.render("admin", { message: "No admin with this email" });
    } else if (req.body.password !== admin.password) {
         res.render("admin", { message: "Password is incorrect" });
    }

    console.log('Successfully logged in');
    res.render("adminPanel");
};


module.exports = adminController