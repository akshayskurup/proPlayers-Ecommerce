let homeController ={}

homeController.showHome = async (req,res)=>{
    const userId = req.session.userId;
    console.log('id',userId)
    console.log('home',req.session.UserLogin)
    if(req.session.UserLogin){
        res.render('homePage',{userId})
    }
    else{
        res.redirect('/')
    }
}

homeController.logOut = (req,res)=>{
    req.session.UserLogin = false
    console.log("Log out successfully")
    res.redirect('/')
    console.log(req.session.UserLogin)
}
module.exports = homeController