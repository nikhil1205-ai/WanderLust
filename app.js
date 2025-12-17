require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

// Routes
const listingRouter = require("./Routes/listing");
const reviewRouter = require("./Routes/Review");
const userRouter = require("./Routes/user");

/* ===============================
   DATABASE
================================ */
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

/* ===============================
   APP CONFIG
================================ */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   SESSION STORE
================================ */
const store = MongoStore.create({
  mongoUrl: process.env.MONGODB_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.log("Mongo session store error:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

/* ===============================
   PASSPORT CONFIG
================================ */
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    User.authenticate()
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ===============================
   GLOBAL LOCALS
================================ */
app.use((req, res, next) => {
  res.locals.currUser = req.user || "";
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

/* ===============================
   ROUTES
================================ */
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/user", userRouter);

/* ===============================
   ERROR HANDLING
================================ */
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

/* ===============================
   SERVER
================================ */
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
