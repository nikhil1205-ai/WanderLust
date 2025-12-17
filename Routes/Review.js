const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const { reviewSchema } = require("../Schema");
const {
  isLoggedIn,
  isReviewAuthor,
  redirectUrl,
} = require("../middleware");

/* ===============================
   VALIDATION MIDDLEWARE
================================ */
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message);
  }
  next();
};

/* ===============================
   CREATE REVIEW
================================ */
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;

    listing.review.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "New review added");
    res.redirect(`/listings/${listing._id}`);
  })
);

/* ===============================
   DELETE REVIEW
================================ */
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  redirectUrl,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { review: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
