const mongoose = require('mongoose')


let connnectDB = async ()=>{
    try{
        await mongoose.connect("mongodb://0.0.0.0:27017/ProPlayers_Ecommerce",{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("DataBase connected successfully....")
    }
    catch(err){
        console.log("Error connecting to dataBase",err.message )
        process.exit(1)
    }
}


module.exports = connnectDB