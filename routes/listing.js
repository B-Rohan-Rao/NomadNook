const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js');
const { listingSchema } = require("../schema.js");


const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(error);
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

// Index route
// GET /listing ->all listings
router.get("/", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));


// Read route
router.get("/:id", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));


// Create route
// get /new -> form -> post / ->Insert into db
router.get("/new", (req,res)=>{
    res.render("listings/new.ejs");
});
router.post("/", validateListing, wrapAsync(
    async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));


// edit route
// get /:id/edit ->edit form ->put /:id ->submit
router.get("/:id/edit", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
router.put("/:id", validateListing, wrapAsync(async(req, res)=>{
    let { id } = req.params;
    if(!req.body.listing){
        throw new ExpressError(400,"Not Send valid data for listing")
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));


// Delete route
router.delete("/:id", wrapAsync(async(req, res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;