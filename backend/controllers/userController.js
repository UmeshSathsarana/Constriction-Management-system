const User = require('../models/User'); // Import the User model

// Create User
exports.createUser = async (req, res) => {
  const { name, email, role, password, phone, address } = req.body;

  try {
    // Validate required fields
    if (!name || !role || !password) {
      return res.status(400).json({
        message: 'Name, role, and password are required'
      });
    }

    // For non-worker roles, email is required
    if (role !== 'Worker' && !email) {
      return res.status(400).json({
        message: 'Email is required for non-worker roles'
      });
    }

    // Check if user with email already exists (only if email is provided)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }
    }

    // Create new user
    const newUser = new User({ name, email, role, password, phone, address });
    await newUser.save();
    
    // Don't send password in response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ 
      message: 'User created successfully', 
      user: userResponse 
    });
  } catch (err) {
    console.error('Error creating user:', err);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({ 
        message: 'Email address already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating user', 
      error: err.message 
    });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    // Build filter
    let filter = {};
    if (role) {
      filter.role = role;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({ 
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: err.message 
    });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error fetching user',
      error: err.message 
    });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data (handle separately for security)
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }

    // If updating email, check for duplicates
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: id }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email address already exists'
        });
      }
    }

    // Validate role if being updated
    if (updateData.role) {
      const validRoles = ['Admin', 'Project Manager', 'Site Supervisor', 'Worker', 'Inventory Manager', 'Financial Manager'];
      if (!validRoles.includes(updateData.role)) {
        return res.status(400).json({
          message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating user:', err);
    
    // Handle duplicate email error
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(400).json({ 
        message: 'Email address already exists' 
      });
    }
    
    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error updating user',
      error: err.message 
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role
      }
    });
  } catch (err) {
    console.error('Error deleting user:', err);

    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'Invalid user ID format'
      });
    }

    res.status(500).json({
      message: 'Error deleting user',
      error: err.message
    });
  }
};

// Toggle User Status (Active/Inactive)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Toggle the active status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('Error toggling user status:', err);

    // Handle invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        message: 'Invalid user ID format'
      });
    }

    res.status(500).json({
      message: 'Error toggling user status',
      error: err.message
    });
  }
};

// Verify all exports
console.log('✅ User controller functions exported:', {
  createUser: typeof exports.createUser,
  getAllUsers: typeof exports.getAllUsers,
  getUserById: typeof exports.getUserById,
  updateUser: typeof exports.updateUser,
  deleteUser: typeof exports.deleteUser,
  toggleUserStatus: typeof exports.toggleUserStatus
});
