const Collection = require('../models/collection');
const Artwork = require('../models/artwork');
const Leaf = require('../models/leaf');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const collections = await Collection.find({}).sort({ orderKey: 1 }).sort({ createdAt: 'desc' })
    const leaves = await Leaf.find({}).sort({ orderKey: 1 })
    res.render('collections/index', {
        collections,
        leaves,
        searchOptions: req.query
    })
}

module.exports.renderNewForm = (req, res) => {
    res.render('collections/new', { title: "Admin" });
}

module.exports.createCollection = async (req, res, next) => {
    const collection = new Collection(req.body.collection);
    collection.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    collection.author = req.user._id;
    await collection.save();
    console.log(collection);
    req.flash('success', 'Successfully made a new collection!');
    res.redirect('/admin')
}

module.exports.showCollection = async (req, res,) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const collections = await Collection.find({})
    const collection = await Collection.findOne({ slug: req.params.slug }).populate({
        path: 'artworks',
        options: {
            sort: { orderKey: 1 },
            sort: { createdAt: 'desc' },
            skip: (perPage * page - perPage),
            limit: perPage,
            populate: "collection"
        },
        populate: {
            path: 'author'
        }
    }).populate('author');

    const artworks = await Artwork.find()
    const artwork = await Artwork.findOne({ slug: req.params.slug })
    const leaves = await Leaf.find({})

    const count = await Artwork.countDocuments();

    if (!collection) {
        req.flash('error', 'Cannot find that collection!');
        return res.redirect('/collections');
    }
    res.render('collections/show', {
        collection,
        collections,
        artworks,
        artwork,
        leaves,
        searchOptions: req.query,
        current: page,
        home: "/collections/" + req.params.slug.toString() + "/?",
        pages: Math.ceil(count / perPage)
    });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const collection = await Collection.findById(id)
    if (!collection) {
        req.flash('error', 'Cannot find that collection!');
        return res.redirect('/collections');
    }
    res.render('collections/edit', {
        collection,
        searchOptions: req.query
    });
}

module.exports.updateCollection = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const collection = await Collection.findByIdAndUpdate(id, { ...req.body.collection });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    collection.images.push(...imgs);
    await collection.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await collection.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated collection!');
    res.redirect('/admin')
    // res.redirect(`/collections/${collection.slug}`)
}

module.exports.deleteCollection = async (req, res) => {
    const { id } = req.params;
    await Collection.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted collection')
    res.redirect('/admin');
}