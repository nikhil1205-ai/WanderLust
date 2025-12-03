const mongoose= require("mongoose");
const Schema=mongoose.Schema;
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const UserSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    username: {           // passport-local-mongoose will manage this field
    type: String,
    required: true},

    createdAt: {
    type: Date,
    default: Date.now
  }
    
});

UserSchema.plugin(passportLocalMongoose,{
  usernameField: 'email'
});

module.exports=mongoose.model("User",UserSchema);
