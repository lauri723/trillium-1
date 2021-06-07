const express = require('express')
const router = express.Router()
const Collection = require('../models/collection')
const Artwork = require('../models/artwork')
const Leaf = require('../models/leaf')
const Student = require('../models/student')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

router.get('/', async (req, res) => {
    const collections = await Collection.find({}).sort({ orderKey: 1 }).sort({ createdAt: 'desc' })
    const leaves = await Leaf.find({}).sort({ orderKey: 1 })
    res.render('index', {
        collections,
        leaves,
        searchOptions: req.query,
    })
})

router.get('/admin', async (req, res) => {
    const collection = await Collection.findOne({ slug: req.params.slug })
    const collections = await Collection.find({}).sort({ createdAt: 'desc' }).populate('artworks')
    const artworks = await Artwork.find({})
    const artwork = await Artwork.findOne({ slug: req.params.slug })
    const leaves = await Leaf.find({}).sort({ createdAt: 'desc' })
    const leaf = await Leaf.findOne({ slug: req.params.slug })
    const students = await Student.find({}).sort({ createdAt: 'desc' })
    const student = await Student.findOne({ slug: req.params.slug })
    res.render('admin', { collections, collection, artwork, artworks, leaves, leaf, student, students })
})

router.post("/create-payment-intent", async (req, res) => {
    let { items } = req.body
    items = items.map(item => item.id)
    let total = 0
    let amount;
    try {
        let docs = await Artwork.find({
            '_id': { $in: items}
        })
        docs.forEach(doc => total += doc.price)
        amount = total * 100
    } catch(err) {
        console.log(err)
    }
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd"
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
        total
    });
});

module.exports = router