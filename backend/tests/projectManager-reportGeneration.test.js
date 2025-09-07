const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');

describe('Project Manager - Report Generation and Viewing', () => {
  let projectManagerToken;
  let project;
  let report;

  beforeAll(async () => {
    // Create a project manager user
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

    // Create a project
    project = new Project({
      name: 'Project Manager Report Project',
      status: 'Active',
      projectManager: pm._id,
    });
    await project.save();

    // Create a report
    report = new Report({
      project: project._id,
      reportType: 'Progress',
      title: 'Weekly Progress Report',
      description: 'Weekly progress details',
      reportDate: new Date(),
      submittedBy: pm._id,
      status: 'Submitted',
      data: {
        workCompleted: 'Completed foundation and framing',
        materialsUsed: [],
        equipmentUsed: [],
        laborHours: 80,
        expenses: [],
        issues: [],
        recommendations: 'Continue with roofing',
        nextDayPlan: 'Start roofing',
      },
    });
    await report.save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should generate project progress report', async () => {
    const res = await request(app)
      .get(`/reports/project/${project._id}`)
      .set('Authorization', `Bearer ${projectManagerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.reports)).toBe(true);
  });

  it('should view team performance report', async () => {
    const res = await request(app)
      .get(`/reports/user/${projectManagerToken}`)
      .set('Authorization', `Bearer ${projectManagerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.reports)).toBe(true);
  });
});
