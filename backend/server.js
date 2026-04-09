const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const salaryRoutes = require('./routes/salary');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);

// Root
app.get('/', (req, res) => {
  res.send('MiniHR API is running...');
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minihr';

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('Local MongoDB not found. Starting In-Memory Database for demonstration...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const fs = require('fs');
    const dbPath = path.join(__dirname, 'local_mongo_db');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

    const mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dbPath,
        storageEngine: 'wiredTiger'
      }
    });

    // Handle Nodemon restarts seamlessly without locks crushing the next boot
    const shutdown = async () => {
      console.log('Shutting down local Persistent MongoDB...');
      await mongoose.disconnect();
      await mongoServer.stop();
      process.exit(0);
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    process.once('SIGUSR2', shutdown);

    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('In-Memory Persistent MongoDB Connected to folder: local_mongo_db');

    // Seed the admin user
    const User = require('./models/User');
    const EmployeeDetail = require('./models/EmployeeDetail');

    let admin = await User.findOne({ email: 'urvashi@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Urvashi',
        email: 'urvashi@gmail.com',
        password: 'Pass@123',
        role: 'admin'
      });
      console.log('Seeded Admin User: urvashi@gmail.com');
    }

    // Seed the test employee user
    let employee = await User.findOne({ email: 'mahi@gmail.com' });
    if (!employee) {
      employee = await User.create({
        name: 'Mahi',
        email: 'mahi@gmail.com',
        password: 'Password@123',
        role: 'employee'
      });
      
      await EmployeeDetail.create({
        userId: employee._id,
        phone: '+91 9876543210',
        gender: 'Female',
        dob: new Date('1995-01-01'),
        address: 'Test Address, Mumbai',
        basicSalary: 25000,
        overtimeRate: 200,
        designation: 'Software Developer',
        department: 'IT',
        profilePhoto: '',
        documents: []
      });
      
      // Seed Dummy Attendance
      const Attendance = require('./models/Attendance');
      const seedDates = ['2026-04-01T00:00:00.000Z', '2026-04-02T00:00:00.000Z', '2026-04-03T00:00:00.000Z', '2026-04-04T00:00:00.000Z', '2026-04-05T00:00:00.000Z'];
      for (let dt of seedDates) {
         let localDate = new Date(dt);
         localDate.setHours(0,0,0,0);
         await Attendance.create({ userId: employee._id, date: localDate, status: 'present', lateMarks: 0 });
      }
      
      console.log('Seeded Employee User: mahi@gmail.com (Password@123) with 5 days of Attendance!');
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
};

startServer();
