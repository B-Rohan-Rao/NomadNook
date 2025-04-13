const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

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

/*
// All the routes:-

app.get("/listings", ...) 
app.get("/listings/new", ...)
app.post("/listings", ...)
app.get("/listings/:id/edit", ...)
app.put("/listings/:id", ...)
app.delete("/listings/:id", ...)
app.get("/listings/:id", ...)
app.get("/", ...)
*/


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
// Root path

app.get("/",(req,res)=>{
    res.send("This is root path");
});

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(error);
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

// Index route
// GET /listing ->all listings
app.get("/listings", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
//---------------------------------------------------------------------------------------------------------------------

// Create route
// get /listings/new -> form -> post /listings ->Insert into db
app.get("/listings/new", (req,res)=>{
    res.render("listings/new.ejs");
});
app.post("/listings", validateListing, wrapAsync(
    async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));
//---------------------------------------------------------------------------------------------------------------------

// edit route
// get /listing/:id/edit ->edit form ->put /listing/:id/->submit
app.get("/listings/:id/edit", validateListing, wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
app.put("/listings/:id", wrapAsync(async(req, res)=>{
    let { id } = req.params;
    if(!req.body.listing){
        throw new ExpressError(400,"Not Send valid data for listing")
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
//---------------------------------------------------------------------------------------------------------------------

// Delete route

app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//---------------------------------------------------------------------------------------------------------------------
// Read route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));




app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});
app.use((err,req,res,next)=>{
    let {statusCode=500, message="Something went Wrong!"} = err;
    res.status(statusCode).render("listings/error.ejs",{err});
    // res.status(statusCode).send(message);
});
app.listen(8080,(req,res)=>{
    console.log("App listening at port 8080");
});