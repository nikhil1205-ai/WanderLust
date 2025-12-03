const mongoose=require("mongoose");



let reviewSchema=new mongoose.Schema({
     Comment :String,
     rating:{
        type:Number,
        min:1,
        max:5
     },
     createdAt:{
        type:Date,
        default:Date.now()
     },
     author:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
     }
});

const reviewModel=mongoose.model("Review",reviewSchema);
module.exports=reviewModel;
