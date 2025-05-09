const User = require("../models/user.js");

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs")
};


module.exports.signup = async (req,res)=>{
    try{
        let { username, email, password } = req.body;
        let newUser = new User({email,username});
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
            // console.log(registeredUser);
            req.flash("success", "User successfully registered");
            res.redirect("/listings");
        })
    } catch(err){
        req.flash("error", "User already registered");
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};


module.exports.login = async(req,res)=>{
    req.flash("success", "Logged In");
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out");
        res.redirect("/listings");
    })
};