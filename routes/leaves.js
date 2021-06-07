const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const leaves = require('../controllers/leaves');
const { isLoggedIn, isLeafAuthor, validateLeaf } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Leaf = require('../models/leaf');

router.route('/')
    .get(catchAsync(leaves.index))
    .post(isLoggedIn, upload.array('image'), validateLeaf, catchAsync(leaves.createLeaf))

router.get('/new', isLoggedIn, leaves.renderNewForm)

router.route('/:slug')
    .get(catchAsync(leaves.showLeaf))
    
router.route('/:id')
    .put(isLoggedIn, isLeafAuthor, upload.array('image'), catchAsync(leaves.updateLeaf))
    .delete(isLoggedIn, isLeafAuthor, catchAsync(leaves.deleteLeaf));

router.get('/:id/edit', isLoggedIn, isLeafAuthor, catchAsync(leaves.renderEditForm))



module.exports = router;