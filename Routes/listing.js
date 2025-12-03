const express=require("express");
const router=express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const listing=require("../models/listing.js");
const {listSchema,reviewSchema}=require("../Schema.js");
const ExpressError= require("../utils/ExpressError.js")
const {isLoggedIn,isOwner,validateError} =require("../middleware.js");
const {index} = require("../controllers/listings.js")
const multer  = require('multer')
const {storage}=require('../cloudConfig.js');
const upload = multer({storage});

//  >>> main
router.route("/")
    .get(index)
    .post(isLoggedIn,validateError,upload.single('listingNew[image]'),async (req,res) => {
        let url=req.file.path;
        let filename=req.file.fieldname;
        let sc=listSchema.validate(req.body);
        let listingNew = req.body.listingNew;
        let SaveList= new listing({...listingNew,owner:req.user._id,image:{
            url:url,
            filename:filename
        }});
        await SaveList.save();
        req.flash("success","New listing Added");
        res.redirect("/listings");
    });


//  >>> ADDing 
router.get("/new",isLoggedIn,(req,res) => {
    return res.render("./listing/new.ejs"); 
})


// >> Showing  
router.get("/:id",async (req,res) => {
   let {id}=req.params;
   let listData= await listing.findById(id)
   .populate({path:"review",
       populate:{
        path:"author",
       }
   }).populate("owner");
   res.render("./listing/show.ejs",{listData});
})



//  >>> EDIT 
router.get("/:id/edit",isLoggedIn,isOwner,async (req,res)=>{
    let {id}=req.params;
    let listData= await listing.findById(id);
    res.render("./listing/edit.ejs",{listData});
})

router.put("/:id",isLoggedIn,isOwner,upload.single('listingNew[image]'),validateError,async (req,res) => {
    let {id}=req.params ;
    let listData= await listing.findByIdAndUpdate(id,req.body.listingNew);
    if(req.file!=undefined){
    let url=req.file.path;
    let filename=req.file.fieldname;
    listData.image={url,filename};
    await listData.save();
    }
    req.flash("success","Successfully Updated..  ")
    res.redirect(`/listings/${id}`);
})

//  >>> DELETE 
router.delete("/:id/delete",isLoggedIn,isOwner,async (req,res) => {
    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    req.flash("success","listing deleted...  ");
    res.redirect("/listings")
})
   

module.exports = router;