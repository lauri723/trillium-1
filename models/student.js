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

const StudentSchema = new Schema({
    name: String,
    images: [ImageSchema],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },
    orderKey: Number,
    url: String,
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


StudentSchema.pre('validate', function(next) {
    if (this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true })
    }
    
    next()
  })


module.exports = mongoose.model('Student', StudentSchema);