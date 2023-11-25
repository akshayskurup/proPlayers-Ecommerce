let adminPanelController = {}

adminPanelController.showadminPanel=(req,res)=>{
    if(req.session.AdminLogin){
        res.render("adminPanel")
    }
    else{
        res.redirect('/admin')
    }
}
adminPanelController.logOut = (req,res)=>{
    req.session.AdminLogin=false
    console.log("Successfully LogOut from admin")
    res.redirect('/admin')
}


module.exports = adminPanelController