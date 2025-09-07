const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

describe('Project Manager - Task Assignment', () => {
  let projectManagerToken;
  let workerUser;
  let project;
  let task;

  beforeAll(async () => {
    // Connect to in-memory MongoDB
    // Assuming test environment is set up with mongodb-memory-server

    // Create a project manager user and get auth token
    const pm = new User({
      name: 'Project Manager',
      email: 'pm@example.com',
      password: 'password123',
      role: 'Project Manager',
      isActive: true,
    });
    await pm.save();

    // Login to get token
    const loginRes = await request(app)
      .post('/login')
      .send({ email: pm.email, password: 'password123' });
    projectManagerToken = loginRes.body.token;

    // Create a worker user
    workerUser = new User({
      name: 'Worker User',
      email: 'worker@example.com',
      password: 'password123',
      role: 'Worker',
      isActive: true,
    });
    await workerUser.save();

    // Create a project
    project = new Project({
      name: 'Test Project',
      status: 'Active',
    });
    await project.save();

    // Create a task without assignment
    task = new Task({
      name: 'Unassigned Task',
      project: project._id,
      status: 'Pending',
    });
    await task.save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should assign a task to a worker', async () => {
    const res = await request(app)
      .patch(`/tasks/${task._id}/assign`)
      .set('Authorization', `Bearer ${projectManagerToken}`)
      .send({ assignedTo: workerUser._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.assignedTo).toBe(workerUser._id.toString());
  });

  it('should reassign a task to another worker', async () => {
    // Create another worker
    const anotherWorker = new User({
      name: 'Another Worker',
      email: 'anotherworker@example.com',
      password: 'password123',
      role: 'Worker',
      isActive: true,
    });
    await anotherWorker.save();

    const res = await request(app)
      .patch(`/tasks/${task._id}/assign`)
      .set('Authorization', `Bearer ${projectManagerToken}`)
      .send({ assignedTo: anotherWorker._id });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.assignedTo).toBe(anotherWorker._id.toString());
  });
});
