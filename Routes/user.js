const express = require("express");
const router = express.Router();

const User = require("../models/user");
const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { redirectUrl } = require("../middleware");

/* ===============================
   SIGNUP
================================ */

// signup form
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

// signup logic
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = new User({
      username: name,
      email,
    });

    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Zerodha Clone!");
      res.redirect("/listings");
    });
  })
);

/* ===============================
   LOGIN
================================ */

// login form
router.get("/login", (req, res) => {
  res.render("user/login");
});

// login logic
router.post(
  "/login",
  redirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  (req, res) => {
    const redirect = res.locals.redirectUrl || "/listings";
    req.flash("success", "Welcome back!");
    res.redirect(redirect);
  }
);

/* ===============================
   LOGOUT
================================ */

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out");
    res.redirect("/listings");
  });
});

module.exports = router;
