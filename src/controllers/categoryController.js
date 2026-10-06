const Category = require('../models/Category');
const Product = require('../models/Product');

const handleDuplicate = (err, res) => {
  if (err.code === 11000) {
    res.status(409).json({ message: 'Category already exists' });
    return true;
  }
  return false;
};

// GET /api/category (public)
exports.getCategories = async (req, res, next) => {
  try {
    res.json(await Category.find().sort({ name: 1 }));
  } catch (err) {
    next(err);
  }
};

// GET /api/category/:id (public)
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// POST /api/category (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    if (!handleDuplicate(err, res)) next(err);
  }
};

// PUT /api/category/:id (admin) - partial update
// If the name changes, products that used the old name are moved to the new one,
// otherwise they would silently point to a category that no longer exists.
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const oldName = category.name;
    if (req.body.name !== undefined) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    await category.save(); // a duplicate name fails here, before any product is touched

    if (category.name !== oldName) {
      await Product.updateMany({ category: oldName }, { category: category.name });
    }
    res.json(category);
  } catch (err) {
    if (!handleDuplicate(err, res)) next(err);
  }
};

// DELETE /api/category/:id (admin)
// Refuses to delete a category that still has products, to avoid orphaned products.
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const inUse = await Product.countDocuments({ category: category.name });
    if (inUse > 0) {
      return res.status(409).json({
        message: `Cannot delete: ${inUse} product(s) still use this category. Move or delete them first.`,
      });
    }
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
