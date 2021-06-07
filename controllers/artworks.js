const Collection = require('../models/collection');
const Artwork = require('../models/artwork');
const Leaf = require('../models/leaf');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    let query = Artwork.find()
        .sort({ orderKey: 1 })
        .sort({ createdAt: 'desc' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("collection");
    if (req.query.tags != null && req.query.tags != '') {
        query = query.regex('tags', new RegExp(req.query.tags, 'i'))
    }

    const count = await Artwork.countDocuments();

    const artworks = await query.exec()
    const collections = await Collection.find()
        .sort({ orderKey: 1 })
        .sort({ createdAt: 'desc' })

    const leaves = await Leaf.find({})

    res.render('artworks', {
        artworks,
        searchOptions: req.query,
        collections,
        leaves,
        current: page,
        home: "/artworks/?",
        pages: Math.ceil(count / perPage)
    })
}

module.exports.createArtwork = async (req, res) => {
    const collection = await Collection.findById(req.params.id);
    const artwork = new Artwork(req.body.artwork);
    artwork.photos = req.files.map(f => ({ url: f.path, filename: f.filename }));
    artwork.author = req.user._id;
    collection.artworks.push(artwork);
    await artwork.save();
    await collection.save();
    console.log(artwork)
    req.flash('success', 'Created new artwork!');
    res.redirect('/admin')
    // res.redirect(`/collections/${collection.slug}`);
}

module.exports.showArtwork = async (req, res,) => {
    // const { artworkId } = req.params;
    const artwork = await Artwork.findOne({ slug: req.params.slug })
    const collections = await Collection.find({})
    const collection = await Collection.findOne({ slug: req.params.slug })
    const leaves = await Leaf.find({})
    // const artwork = await Artwork.findById(req.params.artworkId)
    if (!artwork) {
        req.flash('error', 'Cannot find that artwork!');
        return res.redirect('/artworks');
    }
    // res.render('collections', { 
    // res.render(`/collections/${collection.slug}`, { 
    res.render('artworks/show', { 
        collection_id: req.params.id, 
        artwork,
        collection,
        collections,
        leaves,
        searchOptions: req.query
    });
}

module.exports.renderEditForm = async (req, res) => {
    const { artworkId } = req.params;
    const artwork = await Artwork.findById(artworkId);
    const leaves = await Leaf.find({})
    if (!artwork) {
        req.flash('error', 'Cannot find that artwork!');
        return res.redirect('/artworks');
    }
    res.render('artworks/edit', { 
        collection_id: req.params.id, 
        artwork: artwork,
        leaves,
        searchOptions: req.query
    });
}

module.exports.updateArtwork = async (req, res) => {
    const { id, artworkId } = req.params;
    const artwork = await Artwork.findByIdAndUpdate(artworkId, { ...req.body.artwork });
    const photos = req.files.map(f => ({ url: f.path, filename: f.filename }));
    artwork.photos.push(...photos);
    await artwork.save();
    if (req.body.deletePhotos) {
        for (let filename of req.body.deletePhotos) {
            await cloudinary.uploader.destroy(filename);
        }
        await artwork.updateOne({ $pull: { photos: { filename: { $in: req.body.deletePhotos } } } })
    }
    console.log(req.body);
    req.flash('success', 'Successfully updated artwork!');
    res.redirect('/admin');
}

module.exports.deleteArtwork = async (req, res) => {
    const { id, artworkId } = req.params;
    await Collection.findByIdAndUpdate(id, { $pull: { artworks: artworkId } });
    await Artwork.findByIdAndDelete(artworkId);
    req.flash('success', 'Successfully deleted artwork')
    res.redirect('/admin');
}

