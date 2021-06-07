const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateArtwork, isLoggedIn, isArtworkAuthor } = require('../middleware');
const Artwork = require('../models/artwork');
const Collection = require('../models/collection');
const artworks = require('../controllers/artworks');
const collections = require('../controllers/collections');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage3 } = require('../cloudinary');
const upload3 = multer({ storage: storage3 });

router.route('/')
    .get(catchAsync(artworks.index))
    .post(isLoggedIn, upload3.array('photo'), validateArtwork, catchAsync(artworks.createArtwork))

router.route('/:slug/show')
    .get(catchAsync(artworks.showArtwork))

router.route('/:artworkId')
    .put(isLoggedIn, isArtworkAuthor, upload3.array('photo'), validateArtwork, catchAsync(artworks.updateArtwork))
    .delete(isLoggedIn, isArtworkAuthor, catchAsync(artworks.deleteArtwork));

router.get('/:artworkId/edit', isLoggedIn, isArtworkAuthor, catchAsync(artworks.renderEditForm))



module.exports = router;