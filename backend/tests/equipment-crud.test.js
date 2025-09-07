const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Project = require('../models/Project');

describe('Equipment CRUD Operations', () => {
  let adminToken;
  let inventoryManagerToken;
  let testEquipment;
  let testProject;
  let testWorker;

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

    // Create worker
    testWorker = new User({
      name: 'Test Worker',
      email: 'worker@example.com',
      password: 'password123',
      role: 'Worker',
      isActive: true,
    });
    await testWorker.save();

    // Create test project
    testProject = new Project({
      name: 'Test Project for Equipment',
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

  describe('POST /equipment - Create Equipment', () => {
    it('should create a single equipment successfully', async () => {
      const equipmentData = {
        name: 'Excavator X200',
        code: 'EXC001',
        description: 'Heavy duty excavator for construction',
        type: 'Excavator',
        model: 'X200',
        manufacturer: 'HeavyMachinery Inc',
        serialNumber: 'EXC2024001',
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: 250000,
        condition: 'Excellent',
        status: 'Available',
        location: 'Equipment Yard A',
        specifications: {
          enginePower: '200HP',
          bucketCapacity: '1.5 cubic meters',
          operatingWeight: '45000kg',
        },
      };

      const res = await request(app)
        .post('/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(equipmentData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Equipment created successfully');
      expect(res.body.equipment).toHaveProperty('name', 'Excavator X200');
      expect(res.body.equipment).toHaveProperty('code', 'EXC001');
      expect(res.body.equipment).toHaveProperty('status', 'Available');

      testEquipment = res.body.equipment;
    });

    it('should create multiple equipment items', async () => {
      const equipmentArray = [
        {
          name: 'Bulldozer D100',
          code: 'BLD001',
          type: 'Bulldozer',
          condition: 'Good',
          status: 'Available',
        },
        {
          name: 'Crane C50',
          code: 'CRN001',
          type: 'Crane',
          condition: 'Excellent',
          status: 'Available',
        },
      ];

      const res = await request(app)
        .post('/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(equipmentArray);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Multiple equipment created successfully');
      expect(res.body.equipment).toHaveLength(2);
      expect(res.body.equipment[0]).toHaveProperty('name', 'Bulldozer D100');
      expect(res.body.equipment[1]).toHaveProperty('name', 'Crane C50');
    });

    it('should fail to create equipment without required fields', async () => {
      const incompleteData = {
        name: 'Incomplete Equipment',
        // Missing required fields
      };

      const res = await request(app)
        .post('/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteData);

      expect(res.statusCode).toBe(500); // Validation error
    });
  });

  describe('GET /equipment - View All Equipment', () => {
    it('should retrieve all equipment', async () => {
      const res = await request(app)
        .get('/equipment')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('equipment');
      expect(Array.isArray(res.body.equipment)).toBe(true);
      expect(res.body.equipment.length).toBeGreaterThan(0);
    });

    it('should filter equipment by status', async () => {
      const res = await request(app)
        .get('/equipment?status=Available')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      res.body.equipment.forEach(equipment => {
        expect(equipment.status).toBe('Available');
      });
    });

    it('should filter equipment by type', async () => {
      const res = await request(app)
        .get('/equipment?type=Excavator')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const excavators = res.body.equipment.filter(eq => eq.type === 'Excavator');
      expect(excavators.length).toBeGreaterThan(0);
    });

    it('should filter equipment by condition', async () => {
      const res = await request(app)
        .get('/equipment?condition=Excellent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      res.body.equipment.forEach(equipment => {
        expect(equipment.condition).toBe('Excellent');
      });
    });

    it('should filter equipment by project', async () => {
      const res = await request(app)
        .get(`/equipment?project=${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      // Initially no equipment assigned to project
      expect(res.body.equipment.length).toBe(0);
    });
  });

  describe('GET /equipment/:id - View Equipment by ID', () => {
    it('should retrieve a specific equipment by ID', async () => {
      const res = await request(app)
        .get(`/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.equipment).toHaveProperty('_id', testEquipment._id);
      expect(res.body.equipment).toHaveProperty('name', 'Excavator X200');
      expect(res.body.equipment).toHaveProperty('usageHistory');
    });

    it('should return 404 for non-existent equipment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/equipment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Equipment not found');
    });
  });

  describe('PUT /equipment/:id - Update Equipment', () => {
    it('should update equipment successfully', async () => {
      const updateData = {
        name: 'Updated Excavator X200',
        description: 'Updated heavy duty excavator',
        condition: 'Good',
        location: 'Equipment Yard B',
      };

      const res = await request(app)
        .put(`/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Equipment updated successfully');
      expect(res.body.equipment).toHaveProperty('name', 'Updated Excavator X200');
      expect(res.body.equipment).toHaveProperty('condition', 'Good');
    });

    it('should update equipment status', async () => {
      const updateData = {
        status: 'Under Maintenance',
      };

      const res = await request(app)
        .put(`/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.equipment).toHaveProperty('status', 'Under Maintenance');
    });

    it('should fail to update non-existent equipment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Non-existent Equipment Update',
      };

      const res = await request(app)
        .put(`/equipment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Equipment not found');
    });
  });

  describe('PATCH /equipment/:id/assign - Assign Equipment to Project', () => {
    beforeAll(async () => {
      // Reset equipment status to Available for assignment
      await Equipment.findByIdAndUpdate(testEquipment._id, { status: 'Available' });
    });

    it('should assign equipment to project successfully', async () => {
      const assignData = {
        projectId: testProject._id,
        userId: testWorker._id,
        notes: 'Assigned for foundation work',
      };

      const res = await request(app)
        .patch(`/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Equipment assigned to project successfully');
      expect(res.body.equipment).toHaveProperty('status', 'In Use');
      expect(res.body.equipment).toHaveProperty('currentProject', testProject._id.toString());
      expect(res.body.equipment).toHaveProperty('assignedTo', testWorker._id.toString());
    });

    it('should fail to assign equipment that is already in use', async () => {
      const assignData = {
        projectId: testProject._id,
        userId: testWorker._id,
      };

      const res = await request(app)
        .patch(`/equipment/${testEquipment._id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(assignData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Equipment is already in use');
    });
  });

  describe('PATCH /equipment/:id/return - Return Equipment from Project', () => {
    it('should return equipment from project successfully', async () => {
      const returnData = {
        hoursUsed: 40,
        condition: 'Good',
        notes: 'Returned after foundation work completion',
      };

      const res = await request(app)
        .patch(`/equipment/${testEquipment._id}/return`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(returnData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Equipment returned successfully');
      expect(res.body.equipment).toHaveProperty('status', 'Available');
      expect(res.body.equipment).toHaveProperty('currentProject', null);
      expect(res.body.equipment).toHaveProperty('assignedTo', null);
    });

    it('should fail to return equipment that is not in use', async () => {
      const returnData = {
        hoursUsed: 10,
        condition: 'Excellent',
      };

      const res = await request(app)
        .patch(`/equipment/${testEquipment._id}/return`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(returnData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Equipment is not currently in use');
    });
  });

  describe('GET /equipment/available - Get Available Equipment', () => {
    it('should retrieve only available equipment', async () => {
      const res = await request(app)
        .get('/equipment/available')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.equipment)).toBe(true);
      res.body.equipment.forEach(equipment => {
        expect(equipment.status).toBe('Available');
      });
    });
  });

  describe('GET /equipment/project/:projectId - Get Equipment by Project', () => {
    beforeAll(async () => {
      // Re-assign equipment to project for testing
      await Equipment.findByIdAndUpdate(testEquipment._id, {
        status: 'In Use',
        currentProject: testProject._id,
        assignedTo: testWorker._id,
      });
    });

    it('should retrieve equipment assigned to specific project', async () => {
      const res = await request(app)
        .get(`/equipment/project/${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.equipment)).toBe(true);
      expect(res.body.equipment.length).toBeGreaterThan(0);

      // Check that returned equipment belongs to the project
      res.body.equipment.forEach(equipment => {
        expect(equipment.currentProject.toString()).toBe(testProject._id.toString());
      });
    });
  });

  describe('PATCH /equipment/:id/maintenance - Schedule Maintenance', () => {
    it('should schedule maintenance successfully', async () => {
      const maintenanceData = {
        type: 'Preventive',
        description: 'Regular maintenance check',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        cost: 500,
        performedBy: testWorker._id,
      };

      const res = await request(app)
        .patch(`/equipment/${testEquipment._id}/maintenance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(maintenanceData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Maintenance scheduled successfully');
      expect(res.body.equipment).toHaveProperty('maintenanceHistory');
      expect(res.body.equipment.maintenanceHistory.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /equipment/:id - Delete Equipment', () => {
    beforeAll(async () => {
      // Return equipment to make it available for deletion
      await Equipment.findByIdAndUpdate(testEquipment._id, {
        status: 'Available',
        currentProject: null,
        assignedTo: null,
      });
    });

    it('should delete equipment successfully', async () => {
      const res = await request(app)
        .delete(`/equipment/${testEquipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Equipment deleted successfully');
      expect(res.body.deletedEquipment).toHaveProperty('id', testEquipment._id);
    });

    it('should return 404 when deleting non-existent equipment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/equipment/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Equipment not found');
    });
  });
});
