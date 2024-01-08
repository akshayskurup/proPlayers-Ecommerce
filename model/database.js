const mongoose = require('mongoose')

let connnectDB = async ()=>{
    try{
        await mongoose.connect("mongodb://akshayskurup:uuqvWOc0lnzQrbw6@ac-bxoq78f-shard-00-00.ph4xbey.mongodb.net:27017,ac-bxoq78f-shard-00-01.ph4xbey.mongodb.net:27017,ac-bxoq78f-shard-00-02.ph4xbey.mongodb.net:27017/?ssl=true&replicaSet=atlas-j61sz7-shard-0&authSource=admin&retryWrites=true&w=majority",{
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