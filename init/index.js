const mongoose = require("mongoose");
const Listing = require('../models/listing.js')
const initData = require("./data.js");
const { object } = require("joi");

async function main() {
  // await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
  await mongoose.connect("mongodb+srv://riteshnagpal1707:oZ97fVP8AEeBGyAt@cluster0.60nicey.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  
}

main().then()

async function initDB(){
  try{
    await Listing.deleteMany({})
    // initData.data = initData.data.map((obj)=>({...obj, owner:'666ce6b567639390dadbebf5'}))
    initData.data = initData.data.map((obj)=>({...obj,owner:'6695deb14ec1f101dcb4a5b5'}))
    await Listing.insertMany(initData.data)
    }
    catch(err){
      console.log(err)
    }
    console.log("Data initialized");
}

initDB();