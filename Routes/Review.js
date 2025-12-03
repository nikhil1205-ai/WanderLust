const express=require("express");
const router=express.Router();
const listing=require("../models/listing.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError.js")
const reviewModel = require("../models/review.js");
const {listSchema,reviewSchema}=require("../Schema.js");
const {isLoggedIn,isReviewAuthor,redirectUrl} = require("../middleware.js");


const reviewValidate= (req,res,next) =>{
     let err=reviewSchema.validate(req.body);
    if(err.error){
        throw new ExpressError(404,err.error);
    }else{
        next();
    }
}

// >>> REview 

router.post("/:id",isLoggedIn,reviewValidate,async (req,res)=>{
    let list= await listing.findById(req.params.id);
    let newReview=new reviewModel(req.body.review);
    list.review.push(newReview);
    newReview.author=req.user._id;
    await newReview.save();
    await list.save();
    req.flash("success","New Review Added");
    res.redirect(`/listings/${list.id}`);
}) 

router.delete("/:id/:reviewId/CommentDelete",isLoggedIn,isReviewAuthor,redirectUrl,async (req,res)=>{
    let {id,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    await reviewModel.findByIdAndDelete(reviewId);
     req.flash("success"," Review Deleted ");
    res.redirect(`/listings/${id}`);
})

module.exports=router;