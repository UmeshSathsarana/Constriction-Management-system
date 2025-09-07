// controllers/materialController.js
const Material = require('../models/Material');

exports.createMaterial = async (req, res) => {
  try {
    const newMaterial = new Material(req.body);
    await newMaterial.save();
    res.status(201).json({ 
      message: 'Material created successfully', 
      material: newMaterial 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error creating material', 
      error: err.message 
    });
  }
};

exports.getAllMaterials = async (req, res) => {
  try {
    const { status, type, lowStock } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    const materials = await Material.find(filter).sort({ name: 1 });
    res.status(200).json({ 
      materials,
      count: materials.length 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching materials',
      error: err.message 
    });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('stockHistory.project', 'name pid')
      .populate('stockHistory.updatedBy', 'name email');
      
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json({ material });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching material',
      error: err.message 
    });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMaterial) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json({ 
      message: 'Material updated successfully', 
      material: updatedMaterial 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating material',
      error: err.message 
    });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const deletedMaterial = await Material.findByIdAndDelete(req.params.id);
    if (!deletedMaterial) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json({ 
      message: 'Material deleted successfully',
      deletedMaterial: {
        id: deletedMaterial._id,
        name: deletedMaterial.name
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error deleting material',
      error: err.message 
    });
  }
};

// Update Stock - Real-time inventory management
exports.updateStock = async (req, res) => {
  try {
    const { action, quantity, project, updatedBy, notes } = req.body;
    
    if (!['Added', 'Used', 'Adjusted', 'Returned'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be one of: Added, Used, Adjusted, Returned'
      });
    }

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    await material.updateStock(action, quantity, project, updatedBy, notes);
    
    // Populate the updated material
    await material.populate([
      { path: 'stockHistory.project', select: 'name pid' },
      { path: 'stockHistory.updatedBy', select: 'name email' }
    ]);

    res.status(200).json({
      message: 'Stock updated successfully',
      material
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error updating stock',
      error: err.message
    });
  }
};

// Get Low Stock Materials
exports.getLowStockMaterials = async (req, res) => {
  try {
    const materials = await Material.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    }).sort({ quantity: 1 });

    res.status(200).json({
      materials,
      count: materials.length
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching low stock materials',
      error: err.message
    });
  }
};

// Get Out of Stock Materials
exports.getOutOfStockMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ quantity: 0 }).sort({ name: 1 });

    res.status(200).json({
      materials,
      count: materials.length
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching out of stock materials',
      error: err.message
    });
  }
};

// Get Material Stock History
exports.getStockHistory = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('stockHistory.project', 'name pid')
      .populate('stockHistory.updatedBy', 'name email')
      .select('name code stockHistory');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Sort stock history by date (newest first)
    material.stockHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      material: {
        name: material.name,
        code: material.code,
        stockHistory: material.stockHistory
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching stock history',
      error: err.message
    });
  }
};

// Get Materials by Project
exports.getMaterialsByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Find materials that have been used in this project
    const materials = await Material.find({
      'stockHistory.project': projectId
    }).populate('stockHistory.project', 'name pid')
      .populate('stockHistory.updatedBy', 'name email');

    // Calculate total usage per material for this project
    const materialsWithUsage = materials.map(material => {
      const projectUsage = material.stockHistory
        .filter(history => history.project && history.project._id.toString() === projectId)
        .reduce((total, history) => {
          if (history.action === 'Used') {
            return total + history.quantity;
          }
          return total;
        }, 0);

      return {
        ...material.toObject(),
        projectUsage
      };
    });

    res.status(200).json({
      materials: materialsWithUsage,
      count: materialsWithUsage.length
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching project materials',
      error: err.message
    });
  }
};

// Get Material Statistics
exports.getMaterialStats = async (req, res) => {
  try {
    const totalMaterials = await Material.countDocuments();
    const lowStockCount = await Material.countDocuments({
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });
    const outOfStockCount = await Material.countDocuments({ quantity: 0 });
    
    // Get materials by type
    const materialsByType = await Material.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
        }
      }
    ]);

    // Get total inventory value
    const totalValue = await Material.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$unitPrice'] } }
        }
      }
    ]);

    res.status(200).json({
      totalMaterials,
      lowStockCount,
      outOfStockCount,
      availableCount: totalMaterials - outOfStockCount,
      materialsByType,
      totalInventoryValue: totalValue[0]?.totalValue || 0
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching material statistics',
      error: err.message
    });
  }
};