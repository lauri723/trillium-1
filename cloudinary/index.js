const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Pages',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 900, height: 900, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

const storage2 = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Collections',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 200, height: 200, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

const storage3 = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Artwork',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 525, height: 525 },
            // { width: 525, height: 525, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

const storage4 = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Students',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 275, height: 275, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

module.exports = {
    cloudinary,
    storage,
    storage2,
    storage3,
    storage4
}