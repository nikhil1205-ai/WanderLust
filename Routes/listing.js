const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const Listing = require("../models/listing");
const { listSchema } = require("../Schema");

const {
  isLoggedIn,
  isOwner,
  validateError,
} = require("../middleware");

const { index } = require("../controllers/listings");

const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

/* ===============================
   ROUTES
================================ */

// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(index))
  .post(
    isLoggedIn,
    upload.single("listingNew[image]"),
    validateError,
    wrapAsync(async (req, res) => {
      if (!req.file) {
        throw new ExpressError(400, "Image is required");
      }

      const { path: url, filename } = req.file;

      const listing = new Listing({
        ...req.body.listingNew,
        owner: req.user._id,
        image: { url, filename },
      });

      await listing.save();
      req.flash("success", "New listing added");
      res.redirect("/listings");
    })
  );

// NEW
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new");
});

// SHOW
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listData = await Listing.findById(id)
      .populate({
        path: "review",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listData) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listing/show", { listData });
  })
);

// EDIT FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listData = await Listing.findById(id);

    if (!listData) {
      throw new ExpressError(404, "Listing not found");
    }

    res.render("listing/edit", { listData });
  })
);

// UPDATE
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listingNew[image]"),
  validateError,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
      id,
      req.body.listingNew,
      { new: true }
    );

    if (req.file) {
      const { path: url, filename } = req.file;
      listing.image = { url, filename };
      await listing.save();
    }

    req.flash("success", "Successfully updated");
    res.redirect(`/listings/${id}`);
  })
);

// DELETE
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted");
    res.redirect("/listings");
  })
);

module.exports = router;
