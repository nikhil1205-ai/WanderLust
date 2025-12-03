const express=require("express");
const router=express.Router();
const  User=require("../models/user.js");
const passport = require("passport");
const {redirectUrl}=require("../middleware.js");

router.get('/signup',(req,res) => {
    res.render("./User/Signup.ejs");
})

router.post('/signup',async (req,res)=>{
    let {name,email,password}=req.body;
    let newUser=new User({
        email:email,
        username:name
    });
    let newu=await User.register(newUser,password);
    req.flash("success","User added.. ");
    req.login(newu,(err)=>{
        if(err) return next(err);
        req.flash("success","you are Login");
        return res.redirect("/listings");
    })
})

router.get('/login',(req,res)=>{
    res.render('./User/login.ejs');
})

router.post('/login',redirectUrl,passport.authenticate("local",
    {failureRedirect:'/User/login',failureFlash:true}),
async (req,res)=>{ 
    redirect=res.locals.redirectUrl;
    if(redirect) res.redirect(redirect);
    else res.redirect("/listings");
})

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash("success","you are Logout");
        res.redirect("/listings");
    })
})



module.exports=router;