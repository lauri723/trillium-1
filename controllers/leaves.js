const Leaf = require('../models/leaf');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const leaves = await Leaf.find({}).sort({ orderKey: 1 })
    res.render('leaves/index', { 
        leaves,
        searchOptions: req.query
    })
}

module.exports.renderNewForm = (req, res) => {
    res.render('leaves/new');
}

module.exports.createLeaf = async (req, res, next) => {
    const leaf = new Leaf(req.body.leaf);
    leaf.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    leaf.author = req.user._id;
    await leaf.save();
    console.log(leaf);
    req.flash('success', 'Successfully made a new page!');
    res.redirect('/admin')
}

module.exports.showLeaf = async (req, res,) => {
    // const leaves = await Leaf.find({})
    const leaf = await Leaf.findOne({ slug: req.params.slug })
        .populate('author')
        .sort({ orderKey: 1 });
    const leaves = await Leaf.find({})
    if (!leaf) {
        req.flash('error', 'Cannot find that page!');
        return res.redirect('/leaves');
    }
    res.render('leaves/show', { 
        leaf,
        leaves,
        searchOptions: req.query
    });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const leaf = await Leaf.findById(id);
    if (!leaf) {
        req.flash('error', 'Cannot find that page!');
        return res.redirect('/leaves');
    }
    res.render('leaves/edit', { 
        leaf,
        searchOptions: req.query
    });
}

module.exports.updateLeaf = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const leaf = await Leaf.findByIdAndUpdate(id, { ...req.body.leaf });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    leaf.images.push(...imgs);
    await leaf.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await leaf.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated leaf!');
    // res.redirect(`/leaves/${leaf.slug}`)
    res.redirect('/admin')
}

module.exports.deleteLeaf = async (req, res) => {
    const { id } = req.params;
    await Leaf.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted page')
    // res.redirect('/leaves');
    res.redirect('/admin')
}
 
