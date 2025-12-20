const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a product category']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      value: {
        type: String,
        required: true,
        trim: true
      },
      price: Number,
      sku: String,
      quantity: Number,
      image: {
        public_id: String,
        url: String
      }
    }]
  }],
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  shipping: {
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingClass: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  onSale: {
    type: Boolean,
    default: false
  },
  saleStartDate: Date,
  saleEndDate: Date,
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Review'
  }],
  relatedProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ onSale: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.trackQuantity) return 'in-stock';
  if (this.quantity <= 0) return 'out-of-stock';
  if (this.quantity <= this.lowStockThreshold) return 'low-stock';
  return 'in-stock';
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  const mainImg = this.images.find(img => img.isMain);
  return mainImg || this.images[0] || null;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to generate SKU if not provided
productSchema.pre('save', function(next) {
  if (this.isNew && !this.sku) {
    this.sku = `ARV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

// Pre-save middleware to handle sale status
productSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.saleStartDate && this.saleEndDate) {
    this.onSale = now >= this.saleStartDate && now <= this.saleEndDate;
  } else if (this.comparePrice && this.comparePrice > this.price) {
    this.onSale = true;
  }
  
  next();
});

// Static method to get products with filters
productSchema.statics.getFiltered = function(filters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    brand,
    tags,
    status = 'active',
    featured,
    onSale,
    inStock,
    search,
    sort = '-createdAt',
    page = 1,
    limit = 12
  } = filters;

  let query = this.find();

  // Basic filters
  if (status) query = query.find({ status });
  if (category) query = query.find({ category });
  if (brand) query = query.find({ brand: new RegExp(brand, 'i') });
  if (featured !== undefined) query = query.find({ featured });
  if (onSale !== undefined) query = query.find({ onSale });

  // Price range
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    query = query.find({ price: priceFilter });
  }

  // Tags
  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    query = query.find({ tags: { $in: tagArray } });
  }

  // Stock filter
  if (inStock) {
    query = query.find({
      $or: [
        { trackQuantity: false },
        { trackQuantity: true, quantity: { $gt: 0 } }
      ]
    });
  }

  // Search
  if (search) {
    query = query.find({
      $text: { $search: search }
    });
  }

  // Populate
  query = query.populate('category', 'name slug');

  // Sort
  query = query.sort(sort);

  // Pagination
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(Number(limit));

  return query;
};

// Static method to update ratings
productSchema.statics.updateRatings = async function(productId) {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].averageRating * 10) / 10,
      'ratings.count': stats[0].totalReviews
    });
  } else {
    await this.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0
    });
  }
};

module.exports = mongoose.model('Product', productSchema);