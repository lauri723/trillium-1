const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const students = require('../controllers/students');
const { isLoggedIn, isStudentAuthor, validateStudent } = require('../middleware');
const multer = require('multer');
const { storage4 } = require('../cloudinary');
const upload4 = multer({ storage: storage4 });

const Student = require('../models/student');

router.route('/')
    .get(catchAsync(students.index))
    .post(isLoggedIn, upload4.array('image'), validateStudent, catchAsync(students.createStudent))

router.get('/new', isLoggedIn, students.renderNewForm)

router.route('/:slug')
    .get(catchAsync(students.showStudent))
    
router.route('/:id')
    .put(isLoggedIn, isStudentAuthor, upload4.array('image'), catchAsync(students.updateStudent))
    .delete(isLoggedIn, isStudentAuthor, catchAsync(students.deleteStudent));

router.get('/:id/edit', isLoggedIn, isStudentAuthor, catchAsync(students.renderEditForm))



module.exports = router;