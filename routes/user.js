const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs")
});

router.post("/signup", wrapAsync(async (req,res)=>{
    try{
        let { username, email, password } = req.body;
        let newUser = new User({email,username});
        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "User successfully registered");
        res.redirect("/listings")
    } catch(err){
        req.flash("error", "User already registered");
        res.redirect("/signup");
    }
}));

router.get("/login", (req,res)=>{
    res.render("users/login.ejs")
});

router.post("/login", passport.authenticate('local', {failureRedirect:'/login', failureFlash:true}), async(req,res)=>{
    req.flash("success", "Logged In")
    res.redirect("listings")
});

module.exports = router
