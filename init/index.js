const mongoose = require("mongoose");
const Listing = require('../models/listing.js')
const initData = require("./data.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

main().then()

async function initDB(){
    await Listing.deleteMany({})
    // await Listing.insertMany(data)
    try{
    await Listing.insertMany(initData.data)
    }
    catch(err){
      console.log(err)
    }
    console.log("Data initialized");
}

initDB();