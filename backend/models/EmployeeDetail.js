const mongoose = require('mongoose');

const employeeDetailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  profilePhoto: { type: String }, // Path to file
  documents: [{
    title: { type: String },
    path: { type: String }
  }],
  basicSalary: { type: Number, required: true },
  overtimeRate: { type: Number, required: true, default: 0 },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('EmployeeDetail', employeeDetailSchema);
