const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

// Connect to db

const MONGODB_URL = "mongodb://127.0.0.1:27017/nomadnook"
main().then(()=>console.log('MongoDB Connected')).catch((err)=>console.log(err));
async function main(){
    await mongoose.connect(MONGODB_URL);
}


app.get("/",(req,res)=>{
    res.send("This is root path");
});

// app.get("/testlisting",async (req,res)=>{
//     let samplelisting= new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country:"India"
//     });
//     await samplelisting.save();
//     console.log("Sample was saved")
//     res.send("successful testing");
// });

// Index route
// GET /listing ->all listings
app.get("/listings", async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});
//---------------------------------------------------------------------------------------------------------------------

// New route
// get /listings/new -> form -> post /listings ->Insert into db
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});
app.post("/listings", async(req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save()
    res.redirect("/listings")
});
//---------------------------------------------------------------------------------------------------------------------

// edit route
// grt /listing/:id/edit ->edit form ->put /listing/:id/->submit
app.get("/listings/:id/edit", async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
})
app.put("/listings/:id", async(req, res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})
//---------------------------------------------------------------------------------------------------------------------

// Delete route

app.delete("/listings/:id", async(req, res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

//---------------------------------------------------------------------------------------------------------------------
// Read route
app.get("/listings/:id", async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});



app.listen(8080,(req,res)=>{
    console.log("App listening at port 8080");
});