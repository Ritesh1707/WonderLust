const mongoose = require("mongoose");
const Listing = require('../models/listing.js')
const initData = require("./data.js");
const { object } = require("joi");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
}

main().then()

async function initDB(){
  try{
    await Listing.deleteMany({})
    // initData.data = initData.data.map((obj)=>({...obj, owner:'666ce6b567639390dadbebf5'}))
    initData.data = initData.data.map((obj)=>({...obj,owner:'6672c7a02d3506e97a99202d'}))
    await Listing.insertMany(initData.data)
    }
    catch(err){
      console.log(err)
    }
    console.log("Data initialized");
}

initDB();