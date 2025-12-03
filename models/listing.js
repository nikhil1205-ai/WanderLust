const mongoose= require("mongoose");
const Review = require("./review.js")
const Schema=mongoose.Schema;

const listingS = new Schema({
    title: {
        type:String,
        required:false,  
    },
    description: String,
    image: {
        url:String,
        filename:String,
    },
    price:{type:Number,default:0},
    location:String,
    country:String,
     review: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

listingS.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
})

const list=mongoose.model("Listing",listingS);
module.exports = list;


