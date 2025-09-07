const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Client = require('../models/Client');

describe('Project CRUD Operations', () => {
  let adminToken;
  let projectManagerToken;
  let client;
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

    // Create project manager
    const pm = new User({
      name: 'Project Manager',
      email: 'pm@example.com',
      password: 'password123',
      role: 'Project Manager',
      isActive: true,
    });
    await pm.save();

    // Create client
    client = new Client({
      name: 'Test Client Company',
      company: 'Test Construction Ltd',
      email: 'client@example.com',
      phone: '123-456-7890',
      address: '123 Test Street',
      contactPerson: 'John Doe',
      budget: 1000000,
    });
    await client.save();

    // Get admin token
    const adminLogin = await request(app)
      .post('/login')
      .send({ email: admin.email, password: 'password123' });
    adminToken = adminLogin.body.token;

    // Get project manager token
    const pmLogin = await request(app)
      .post('/login')
      .send({ email: pm.email, password: 'password123' });
    projectManagerToken = pmLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /projects - Create Project', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        name: 'Test Construction Project',
        description: 'A test construction project',
        location: 'Downtown Area',
        budget: 500000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'Planning',
        client: client._id,
        certificateCode: 'CERT123',
      };

      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(projectData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Project created successfully');
      expect(res.body.project).toHaveProperty('name', 'Test Construction Project');
      expect(res.body.project).toHaveProperty('certificateCode', 'CERT123');

      testProject = res.body.project;
    });

    it('should fail to create project with invalid client ID', async () => {
      const projectData = {
        name: 'Invalid Project',
        client: new mongoose.Types.ObjectId(), // Invalid ID
      };

      const res = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(projectData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Client not found');
    });

    it('should fail to create project without authentication', async () => {
      const projectData = {
        name: 'Unauthorized Project',
      };

      const res = await request(app)
        .post('/projects')
        .send(projectData);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /projects - View All Projects', () => {
    it('should retrieve all projects', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('projects');
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThan(0);
    });

    it('should retrieve projects with populated client data', async () => {
      const res = await request(app)
        .get('/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const project = res.body.projects.find(p => p._id === testProject._id);
      expect(project).toBeDefined();
      expect(project.client).toHaveProperty('name', 'Test Client Company');
    });
  });

  describe('GET /projects/:id - View Project by ID', () => {
    it('should retrieve a specific project by ID', async () => {
      const res = await request(app)
        .get(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.project).toHaveProperty('_id', testProject._id);
      expect(res.body.project).toHaveProperty('name', 'Test Construction Project');
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });
  });

  describe('PUT /projects/:id - Update Project', () => {
    it('should update project successfully', async () => {
      const updateData = {
        name: 'Updated Construction Project',
        description: 'Updated description',
        budget: 600000,
        certificateCode: 'CERT123', // Required for updates when set
      };

      const res = await request(app)
        .put(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Project updated successfully');
      expect(res.body.project).toHaveProperty('name', 'Updated Construction Project');
      expect(res.body.project).toHaveProperty('budget', 600000);
    });

    it('should fail to update without certificate code when required', async () => {
      const updateData = {
        name: 'Unauthorized Update',
        // Missing certificateCode
      };

      const res = await request(app)
        .put(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Certificate code is required');
    });

    it('should fail to update non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Non-existent Project Update',
      };

      const res = await request(app)
        .put(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });
  });

  describe('DELETE /projects/:id - Delete Project', () => {
    it('should delete project successfully', async () => {
      const res = await request(app)
        .delete(`/projects/${testProject._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Project deleted successfully');
      expect(res.body.deletedProject).toHaveProperty('id', testProject._id);
    });

    it('should return 404 when deleting non-existent project', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/projects/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Project not found');
    });
  });

  describe('GET /projects/search/:name - Search Projects', () => {
    beforeAll(async () => {
      // Create another project for search testing
      const searchProject = new Project({
        name: 'Search Test Project',
        description: 'Project for search testing',
        status: 'Active',
        client: client._id,
      });
      await searchProject.save();
    });

    it('should search projects by name', async () => {
      const res = await request(app)
        .get('/projects/search/Search')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.projects.length).toBeGreaterThan(0);
      expect(res.body.projects[0].name).toContain('Search');
    });

    it('should return empty array for no matches', async () => {
      const res = await request(app)
        .get('/projects/search/NonExistentProjectName')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('No projects found with that name');
    });
  });
});
