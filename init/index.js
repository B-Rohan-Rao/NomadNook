const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


const MONGODB_URL = "mongodb://127.0.0.1:27017/nomadnook"
main().then(()=>console.log('MongoDB Connected')).catch((err)=>console.log(err));
async function main(){
    await mongoose.connect(MONGODB_URL);
}


const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner:"68024ea74215e9d850174fd2"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized")
};

initDB();