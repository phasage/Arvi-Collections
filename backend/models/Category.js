const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    public_id: String,
    url: String,
    alt: String
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to set level based on parent
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent') && this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
    }
  } else if (!this.parent) {
    this.level = 0;
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ status: 'active' })
    .sort({ sortOrder: 1, name: 1 })
    .populate('subcategories');
  
  // Build tree structure
  const categoryMap = {};
  const tree = [];
  
  // First pass: create map
  categories.forEach(category => {
    categoryMap[category._id] = {
      ...category.toObject(),
      children: []
    };
  });
  
  // Second pass: build tree
  categories.forEach(category => {
    if (category.parent) {
      const parent = categoryMap[category.parent];
      if (parent) {
        parent.children.push(categoryMap[category._id]);
      }
    } else {
      tree.push(categoryMap[category._id]);
    }
  });
  
  return tree;
};

// Static method to get all descendants
categorySchema.statics.getDescendants = async function(categoryId) {
  const descendants = [];
  
  const findChildren = async (parentId) => {
    const children = await this.find({ parent: parentId, status: 'active' });
    
    for (const child of children) {
      descendants.push(child._id);
      await findChildren(child._id);
    }
  };
  
  await findChildren(categoryId);
  return descendants;
};

// Instance method to get full path
categorySchema.methods.getPath = async function() {
  const path = [this];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current);
    } else {
      break;
    }
  }
  
  return path;
};

module.exports = mongoose.model('Category', categorySchema);