const Leaf = require('../models/leaf');
const Student = require('../models/student');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    let query = Student.find()
        .sort({ orderKey: 1 })
        .sort({ createdAt: 'desc' })
        .skip(perPage * page - perPage)
        .limit(perPage)
    if (req.query.name!= null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }

    const count = await Student.countDocuments();

    const students = await query.exec()
    const leaves = await Leaf.find({})

    res.render('students', {
        students,
        searchOptions: req.query,
        leaves,
        current: page,
        home: "/students/?",
        pages: Math.ceil(count / perPage)
    })
}




module.exports.renderNewForm = (req, res) => {
    res.render('students/new', { title: "Admin" });
}

module.exports.createStudent = async (req, res, next) => {
    const student = new Student(req.body.student);
    student.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    student.author = req.user._id;
    await student.save();
    console.log(student);
    req.flash('success', 'Successfully made a new student!');
    res.redirect(`/students/${student.slug}`)
}

module.exports.showStudent = async (req, res,) => {
    const students = await Student.find({})
    const student = await Student.findOne({ slug: req.params.slug })
        .populate('author')
        .sort({ orderKey: 1 });
    
    const leaves = await Leaf.find({})


    if (!student) {
        req.flash('error', 'Cannot find that student!');
        return res.redirect('/students');
    }
    res.render('students/show', {
        student,
        students,
        leaves,
        searchOptions: req.query
    });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id)
    if (!student) {
        req.flash('error', 'Cannot find that student!');
        return res.redirect('/students');
    }
    res.render('students/edit', {
        student,
        searchOptions: req.query
    });
}

module.exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const student = await Student.findByIdAndUpdate(id, { ...req.body.student });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    student.images.push(...imgs);
    await student.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await student.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated student!');
    res.redirect('/admin')
}

module.exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    await Student.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted student')
    res.redirect('/admin');
}

