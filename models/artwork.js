const mongoose = require('mongoose');
const slugify = require('slugify')
const Collection = require('./collection')
const Schema = mongoose.Schema;


const PhotoSchema = new Schema({
    url: String,
    filename: String
});

PhotoSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const ArtworkSchema = new Schema({
    title: String,
    photos: [PhotoSchema],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    orderKey: Number,
    description: String,
    size: String,
    medium: String,
    price: Number,
    tags: String,
    notation: String,
    slug: {
        type: String,
        required: true,
        unique: true
      },
    available: { type: Boolean, default: true }
}, opts);

ArtworkSchema.pre('validate', function(next) {
    if (this.title) {
      this.slug = slugify(this.title + "-" + Math.floor(1000 + Math.random() * 9000), { lower: true, strict: true })
    }
    
    next()
  })

module.exports = mongoose.model("Artwork", ArtworkSchema);

