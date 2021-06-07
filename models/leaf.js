const mongoose = require('mongoose');
const slugify = require('slugify')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const LeafSchema = new Schema ({
    title: String,
    images: [ImageSchema],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },
    notice: String,
    content: String,
    orderKey: Number,
    slug: {
        type: String,
        required: true,
        unique: true
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, opts);


LeafSchema.pre('validate', function(next) {
    if (this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true })
    }
    
    next()
  })


  module.exports = mongoose.model('Leaf', LeafSchema);