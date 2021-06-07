const express = require('express');
const router = express.Router();
const collections = require('../controllers/collections');
const leaves = require('../controllers/leaves');
const artworks = require('../controllers/artworks');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCollection } = require('../middleware');
const multer = require('multer');
const { storage2 } = require('../cloudinary');
const upload2 = multer({ storage: storage2 });

const Collection = require('../models/collection');
const Artwork = require('../models/artwork');
const Leaf = require('../models/leaf');

router.route('/')
    .get(catchAsync(collections.index))
    .post(isLoggedIn, upload2.array('image'), validateCollection, catchAsync(collections.createCollection))

router.get('/new', isLoggedIn, collections.renderNewForm)

router.route('/:slug')
    .get(catchAsync(collections.showCollection))
    
router.route('/:id')
    .put(isLoggedIn, isAuthor, upload2.array('image'), validateCollection, catchAsync(collections.updateCollection))
    .delete(isLoggedIn, isAuthor, catchAsync(collections.deleteCollection));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(collections.renderEditForm))



module.exports = router;