const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.API_SECRET
})

// temp-debug.js


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_dev', resource_type: 'auto',
    allowed_formats:  ['png','jpg','jpeg','mp4'] 
  },
});

module.exports={
    cloudinary,
    storage
}