const listing=require("../models/listing.js");

module.exports.index=async (req,res) => {
   const allist= await listing.find({});
   res.render("./listing/index.ejs",{allist});
}