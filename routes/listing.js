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
// Create route
router.get("/new", (req,res)=>{
    res.render("listings/new.ejs");
});


// Read route
router.get("/:id", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","This listing does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));


// Create route
// get /new -> form -> post / ->Insert into db

router.post("/", validateListing, wrapAsync(
    async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success","Successfully made a new listing");
        res.redirect("/listings");
}));


// edit route
// get /:id/edit ->edit form ->put /:id ->submit
router.get("/:id/edit", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","This listing does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));
router.put("/:id", validateListing, wrapAsync(async(req, res)=>{
    let { id } = req.params;
    if(!req.body.listing){
        throw new ExpressError(400,"Not Send valid data for listing")
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Edited a listing");
    res.redirect(`/listings/${id}`);
}));


// Delete route
router.delete("/:id", wrapAsync(async(req, res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Successfully deleted a listing");
    res.redirect("/listings");
}));

module.exports = router;