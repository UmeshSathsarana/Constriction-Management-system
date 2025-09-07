const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Progress = require('../models/Progress');

describe('Site Supervisor - Progress Report Submission', () => {
  let siteSupervisorToken;
  let project;
  let progressReport;

  beforeAll(async () => {
    // Create a site supervisor user
    const ss = new User({
      name: 'Site Supervisor',
      email: 'ss@example.com',
      password: 'password123',
      role: 'Site Supervisor',
      isActive: true,
    });
    await ss.save();

    // Login to get token
    const loginRes = await request(app)
      .post('/login')
      .send({ email: ss.email, password: 'password123' });
    siteSupervisorToken = loginRes.body.token;

    // Create a project
    project = new Project({
      name: 'Test Project for Progress',
      status: 'Active',
      siteSupervisor: ss._id,
    });
    await project.save();

    // Create a progress report
    progressReport = {
      project: project._id,
      date: new Date(),
      workCompleted: 'Foundation work completed',
      issues: 'None',
      materialsUsed: 'Cement, Sand',
      weatherConditions: 'Sunny',
      manpower: 10,
      equipmentUsed: 'Excavator',
    };
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should submit a daily progress report', async () => {
    const res = await request(app)
      .post('/progress')
      .set('Authorization', `Bearer ${siteSupervisorToken}`)
      .send(progressReport);

    expect(res.statusCode).toBe(201);
    expect(res.body.progress).toHaveProperty('workCompleted', progressReport.workCompleted);
    expect(res.body.progress).toHaveProperty('project', project._id.toString());
  });

  it('should retrieve progress reports for assigned project', async () => {
    const res = await request(app)
      .get(`/progress/project/${project._id}`)
      .set('Authorization', `Bearer ${siteSupervisorToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.progress)).toBe(true);
  });

  it('should update an existing progress report', async () => {
    // First create a report
    const createRes = await request(app)
      .post('/progress')
      .set('Authorization', `Bearer ${siteSupervisorToken}`)
      .send(progressReport);

    const reportId = createRes.body.progress._id;

    // Update the report
    const updateRes = await request(app)
      .put(`/progress/${reportId}`)
      .set('Authorization', `Bearer ${siteSupervisorToken}`)
      .send({
        ...progressReport,
        workCompleted: 'Updated foundation work',
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.progress.workCompleted).toBe('Updated foundation work');
  });
});
