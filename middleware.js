const { collectionSchema, artworkSchema, leafSchema, studentSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Leaf = require('./models/leaf');
const Collection = require('./models/collection');
const Artwork = require('./models/artwork');
const Student = require('./models/student');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCollection = (req, res, next) => {
    const { error } = collectionSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const collection = await Collection.findById(id);
    if (!collection.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/collections/${id}`);
    }
    next();
}

module.exports.validateArtwork = (req, res, next) => {
    const { error } = artworkSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isArtworkAuthor = async (req, res, next) => {
    const { id, artworkId } = req.params;
    const artwork = await Artwork.findById(artworkId);
    if (!artwork.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/collections/${id}`);
    }
    next();
}

module.exports.validateLeaf = (req, res, next) => {
    const { error } = leafSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isLeafAuthor = async (req, res, next) => {
    const { id } = req.params;
    const leaf = await Leaf.findById(id);
    if (!leaf.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/admin');
    }
    next();
}

module.exports.validateStudent = (req, res, next) => {
    const { error } = studentSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isStudentAuthor = async (req, res, next) => {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/admin');
    }
    next();
}



