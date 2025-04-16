const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const { reviewSchema } = require("../schema.js");

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(error);
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

router.post("/", validateReview, wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newreview = new Review(req.body.review);
    await newreview.save();
    listing.reviews.push(newreview);
    await listing.save();
    console.log("New review saved");
    req.flash("success","New review created");
    res.redirect(`/listings/${listing._id}`);
}));


router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let {id, reviewId} = req.params;
    
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success","Deleted a review");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;