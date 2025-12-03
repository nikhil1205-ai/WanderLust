const listing=require("./models/listing");
const reviewModel = require("./models/review");
const {listSchema,reviewSchema}=require("./Schema.js");
module.exports.isLoggedIn=(req,res,next) =>{
   if(!req.isAuthenticated()){
       req.session.redirectUrl=req.originalUrl;
       req.flash("error","you must log in");
       return  res.redirect("/User/login");
   }
   next();
}

module.exports.redirectUrl=(req,res,next)=>{
    if( req.session.redirectUrl) res.locals.redirectUrl=req.session.redirectUrl;
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let list=await listing.findById(id);
    if( !list.owner._id.equals(res.locals.currUser._id)){
            req.flash("error","You dont have permission... ");
            return  res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateError= (req,res,next) => {
    let {error}=listSchema.validate(req.body);
    console.log(error);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    } 
}


module.exports.isReviewAuthor=async (req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await reviewModel.findById(reviewId);
    if( !review.author.equals(res.locals.currUser._id)){
            req.flash("error","You are not author... ");
            return  res.redirect(`/listings/${id}`);
    }
    next();
}