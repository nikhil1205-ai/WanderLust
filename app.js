require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
// const MongoStore = require('connect-mongo');
const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/Review.js");
const userRouter = require("./Routes/user.js");
const flash=require('connect-flash');
const passport=require("passport");
const localStrategy=require("passport-local");
const  User=require("./models/user.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

//>>> MongoDB
async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res) => {
    res.redirect("/listings");
});


// const store= MongoStore.create({ mongoUrl: process.env.MONGODB_URL,
//     crypto:{
//       secret:"thisissecret"
//     },
//     touchAfter: 24*60*60
//   });

// store.on("error",()=>{
//   console.log("Error accour in mongo-connect");
// })

const sessionOptions = {
  // store,
  secret: process.env.SESSION_SECRET, // put real secret in env
  resave: false,
  saveUninitialized: false, // better default
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Date object
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};



app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
  console.log(res.locals);


});

// app.get("/demo",async(req,res)=>{
//     let fakeUser=new User({
//         Email:"fghfhghgfhgf@gmail.com",
//         username:"delta"
//     });
//     let newu=await User.register(fakeUser,"hefgfddfllo");
//     res.send(newu);
// });

//>>> Routes
app.use("/listings", listingRouter);
app.use("/listings/review", reviewRouter);
app.use("/User",userRouter);


//>>> Error handlings
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});