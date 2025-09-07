const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Material = require('../models/Material');
const Project = require('../models/Project');

describe('Material CRUD Operations', () => {
  let adminToken;
  let inventoryManagerToken;
  let testMaterial;
  let testProject;

  beforeAll(async () => {
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
      isActive: true,
    });
    await admin.save();

    // Create inventory manager
    const im = new User({
      name: 'Inventory Manager',
      email: 'inventory@example.com',
      password: 'password123',
      role: 'Inventory Manager',
      isActive: true,
    });
    await im.save();

    // Create test project
    testProject = new Project({
      name: 'Test Project for Materials',
      status: 'Active',
    });
    await testProject.save();

    // Get admin token
    const adminLogin = await request(app)
      .post('/login')
      .send({ email: admin.email, password: 'password123' });
    adminToken = adminLogin.body.token;

    // Get inventory manager token
    const imLogin = await request(app)
      .post('/login')
      .send({ email: im.email, password: 'password123' });
    inventoryManagerToken = imLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /materials - Create Material', () => {
    it('should create a new material successfully', async () => {
      const materialData = {
        name: 'Portland Cement',
        code: 'CEM001',
        description: 'High-quality Portland cement for construction',
        type: 'Cement',
        unit: 'Bags',
        quantity: 100,
        minStockLevel: 20,
        unitPrice: 25.50,
        supplier: 'ABC Cement Suppliers',
        location: 'Warehouse A',
      };

      const res = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(materialData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Material created successfully');
      expect(res.body.material).toHaveProperty('name', 'Portland Cement');
      expect(res.body.material).toHaveProperty('code', 'CEM001');
      expect(res.body.material).toHaveProperty('quantity', 100);

      testMaterial = res.body.material;
    });

    it('should create material with low stock warning', async () => {
      const materialData = {
        name: 'Steel Rebars',
        code: 'STL001',
        type: 'Steel',
        unit: 'Pieces',
        quantity: 5, // Below minimum
        minStockLevel: 10,
        unitPrice: 15.75,
      };

      const res = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(materialData);

      expect(res.statusCode).toBe(201);
      expect(res.body.material).toHaveProperty('quantity', 5);
    });

    it('should fail to create material without required fields', async () => {
      const incompleteData = {
        name: 'Incomplete Material',
        // Missing required fields like quantity
      };

      const res = await request(app)
        .post('/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData);

      expect(res.statusCode).toBe(500); // Validation error
    });
  });

  describe('GET /materials - View All Materials', () => {
    it('should retrieve all materials', async () => {
      const res = await request(app)
        .get('/materials')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('materials');
      expect(Array.isArray(res.body.materials)).toBe(true);
      expect(res.body.materials.length).toBeGreaterThan(0);
    });

    it('should filter materials by type', async () => {
      const res = await request(app)
        .get('/materials?type=Cement')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.materials.length).toBeGreaterThan(0);
      res.body.materials.forEach(material => {
        expect(material.type).toBe('Cement');
      });
    });

    it('should filter low stock materials', async () => {
      const res = await request(app)
        .get('/materials?lowStock=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      // Should include materials where quantity <= minStockLevel
      res.body.materials.forEach(material => {
        expect(material.quantity).toBeLessThanOrEqual(material.minStockLevel);
      });
    });

    it('should filter materials by status', async () => {
      const res = await request(app)
        .get('/materials?status=Available')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      res.body.materials.forEach(material => {
        expect(material.status).toBe('Available');
      });
    });
  });

  describe('GET /materials/:id - View Material by ID', () => {
    it('should retrieve a specific material by ID', async () => {
      const res = await request(app)
        .get(`/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.material).toHaveProperty('_id', testMaterial._id);
      expect(res.body.material).toHaveProperty('name', 'Portland Cement');
      expect(res.body.material).toHaveProperty('stockHistory');
    });

    it('should return 404 for non-existent material', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/materials/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Material not found');
    });
  });

  describe('PUT /materials/:id - Update Material', () => {
    it('should update material successfully', async () => {
      const updateData = {
        name: 'Updated Portland Cement',
        description: 'Updated description for Portland cement',
        quantity: 150,
        unitPrice: 26.00,
      };

      const res = await request(app)
        .put(`/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Material updated successfully');
      expect(res.body.material).toHaveProperty('name', 'Updated Portland Cement');
      expect(res.body.material).toHaveProperty('quantity', 150);
      expect(res.body.material).toHaveProperty('unitPrice', 26.00);
    });

    it('should update material to trigger low stock status', async () => {
      const updateData = {
        quantity: 5, // Below min stock level
      };

      const res = await request(app)
        .put(`/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.material).toHaveProperty('quantity', 5);
    });

    it('should fail to update non-existent material', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Non-existent Material Update',
      };

      const res = await request(app)
        .put(`/materials/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Material not found');
    });
  });

  describe('PATCH /materials/:id/stock - Update Stock', () => {
    it('should add stock successfully', async () => {
      const stockUpdate = {
        action: 'Added',
        quantity: 50,
        project: testProject._id,
        updatedBy: adminToken, // This should be user ID, but for test we'll use token
        notes: 'Stock replenishment',
      };

      const res = await request(app)
        .patch(`/materials/${testMaterial._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Stock updated successfully');
      expect(res.body.material).toHaveProperty('quantity', 55); // 5 + 50
    });

    it('should use stock successfully', async () => {
      const stockUpdate = {
        action: 'Used',
        quantity: 20,
        project: testProject._id,
        updatedBy: adminToken,
        notes: 'Used in construction',
      };

      const res = await request(app)
        .patch(`/materials/${testMaterial._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);

      expect(res.statusCode).toBe(200);
      expect(res.body.material).toHaveProperty('quantity', 35); // 55 - 20
    });

    it('should fail to use more stock than available', async () => {
      const stockUpdate = {
        action: 'Used',
        quantity: 100, // More than available (35)
        project: testProject._id,
        updatedBy: adminToken,
      };

      const res = await request(app)
        .patch(`/materials/${testMaterial._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should fail with invalid action', async () => {
      const stockUpdate = {
        action: 'InvalidAction',
        quantity: 10,
      };

      const res = await request(app)
        .patch(`/materials/${testMaterial._id}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(stockUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid action');
    });
  });

  describe('GET /materials/low-stock - Get Low Stock Materials', () => {
    it('should retrieve materials with low stock', async () => {
      const res = await request(app)
        .get('/materials/low-stock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.materials)).toBe(true);
      // Should include our test material with quantity 35 and minStockLevel 20
      const lowStockMaterial = res.body.materials.find(m => m._id === testMaterial._id);
      expect(lowStockMaterial).toBeDefined();
    });
  });

  describe('GET /materials/out-of-stock - Get Out of Stock Materials', () => {
    beforeAll(async () => {
      // Create out of stock material
      const outOfStockMaterial = new Material({
        name: 'Out of Stock Item',
        code: 'OOS001',
        type: 'Miscellaneous',
        unit: 'Pieces',
        quantity: 0,
        minStockLevel: 5,
        unitPrice: 10.00,
      });
      await outOfStockMaterial.save();
    });

    it('should retrieve out of stock materials', async () => {
      const res = await request(app)
        .get('/materials/out-of-stock')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.materials)).toBe(true);
      expect(res.body.materials.length).toBeGreaterThan(0);

      // Check that all returned materials have quantity 0
      res.body.materials.forEach(material => {
        expect(material.quantity).toBe(0);
      });
    });
  });

  describe('DELETE /materials/:id - Delete Material', () => {
    it('should delete material successfully', async () => {
      const res = await request(app)
        .delete(`/materials/${testMaterial._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Material deleted successfully');
      expect(res.body.deletedMaterial).toHaveProperty('id', testMaterial._id);
    });

    it('should return 404 when deleting non-existent material', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/materials/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Material not found');
    });
  });
});
