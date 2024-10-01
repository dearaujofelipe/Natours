const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less than 40 characters'],
      minlength: [10, 'A tour must have at least 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is easy either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be  at least 1'],
      max: [5, 'Rating have a max of 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount ({VALUE}) must be less than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, EMBEDDING GUIDES
    // REFERENCING GUIDES BELOW
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // schema options object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// mongoose virtual properties, adds a property that will not be saved on the DB
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//mongoose document middlware, runs befores the .save() and .create() not update()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// mongoose query middleware because 'find', hiding secret tour
// tourSchema.pre('find', function (next) { /^find/ prevents get your by id call so tour keeps secret
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// MODELLING DATA - EMBEDDING GUIDES INTO TOURS , in this case Parent referencing is better
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// REFERENCING MIDDLEWARE that excludes __v and passwordChangedAt of the query result, middleware placed here so i dont have to use .populate... in all the controllers that need it
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

//mongoose aggregation middlware, using to hide secret tour from aggregation
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
