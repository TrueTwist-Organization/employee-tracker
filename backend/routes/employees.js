const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const EmployeeDetail = require('../models/EmployeeDetail');

// GET /api/employees - list
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const employees = await EmployeeDetail.find().populate('userId', 'name email role');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/employees - add new
router.post('/', protect, adminOnly, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documentFiles', maxCount: 10 }
]), async (req, res) => {
  const { name, email, password, phone, gender, dob, address, basicSalary, overtimeRate, designation, department } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: 'employee' });

    const profilePhoto = (req.files && req.files['profilePhoto']) ? req.files['profilePhoto'][0].path : '';
    const documents = (req.files && req.files['documentFiles']) ? req.files['documentFiles'].map(file => ({
      title: file.originalname,
      path: file.path
    })) : [];

    const employee = await EmployeeDetail.create({
      userId: user._id,
      phone, gender, dob, address,
      profilePhoto, documents,
      basicSalary, overtimeRate, designation, department
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/employees/:id - edit
router.put('/:id', protect, adminOnly, upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documentFiles', maxCount: 10 }
]), async (req, res) => {
  try {
    const employee = await EmployeeDetail.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const updates = { ...req.body };
    if (req.files && req.files['profilePhoto']) updates.profilePhoto = req.files['profilePhoto'][0].path;
    if (req.files && req.files['documentFiles']) {
      const newDocs = req.files['documentFiles'].map(file => ({
        title: file.originalname,
        path: file.path
      }));
      updates.documents = [...employee.documents, ...newDocs];
    }

    const updatedEmployee = await EmployeeDetail.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('userId', 'name email role');
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/employees/:userId - profile
router.get('/:userId', protect, async (req, res) => {
  try {
    const employee = await EmployeeDetail.findOne({ userId: req.params.userId }).populate('userId', 'name email');
    if (!employee) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/employees/:id - delete employee
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const employee = await EmployeeDetail.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Delete associated User record
    await User.findByIdAndDelete(employee.userId);
    
    // Delete Employee Detail record
    await EmployeeDetail.findByIdAndDelete(req.params.id);

    res.json({ message: 'Employee and associated user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
