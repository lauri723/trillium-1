const mongoose = require('mongoose');
const slugify = require('slugify')
const Artwork = require('./artwork')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CollectionSchema = new Schema({
    title: String,
    images: [ImageSchema],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },
    orderKey: Number,
    slug: {
        type: String,
        required: true,
        unique: true
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    artworks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Artwork'
        }
    ]
}, opts);


CollectionSchema.pre('validate', function(next) {
    if (this.title) {
      this.slug = slugify(this.title + "-" + Math.floor(1000 + Math.random() * 9000), { lower: true, strict: true })
    }
    
    next()
  })

CollectionSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Artwork.deleteMany({
            _id: {
                $in: doc.artworks
            }
        })
    }
})

module.exports = mongoose.model('Collection', CollectionSchema);