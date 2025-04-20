const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");



// Index route
// GET /listing ->all listings
router.get("/", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
// Create route
router.get("/new", isLoggedIn, (req,res)=>{
    res.render("listings/new.ejs");
});


// Show route
router.get("/:id", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path:"reviews",
        populate:{path:"author"},
    }).populate("owner");
    if(!listing){
        req.flash("error","This listing does not exist");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
}));


// Create route
router.post("/", isLoggedIn, validateListing, wrapAsync(
    async(req,res,next)=>{
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success","Successfully made a new listing");
        res.redirect("/listings");
}));


// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","This listing does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

// Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async(req, res)=>{
    let { id } = req.params;

    if(!req.body.listing){
        throw new ExpressError(400,"Not Send valid data for listing")
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Edited a listing");
    res.redirect(`/listings/${id}`);
}));


// Delete route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async(req, res)=>{
    let{id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Successfully deleted a listing");
    res.redirect("/listings");
}));

module.exports = router;