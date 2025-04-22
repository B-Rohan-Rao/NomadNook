if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js")



app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);



const MONGODB_URL = "mongodb://127.0.0.1:27017/nomadnook"
main().then(()=>console.log('MongoDB Connected')).catch((err)=>console.log(err));
async function main(){
    await mongoose.connect(MONGODB_URL);
}

app.get("/",(req,res)=>{
    res.send("This is root path");
});


const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(sessionOptions));
passport.use(User.createStrategy()); // 👈 This is the correct fix


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
   res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.currentUser = req.user;
   next(); 
});

// app.get("/demoUser", async (req,res)=>{
//     let fakeUser = new User({
//         email:"fakeuser@gmail.com",
//         username: "Student",
//     });
//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter)


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