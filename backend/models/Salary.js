const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  basicSalary: { type: Number, required: true },
  basicEarning: { type: Number, required: true },
  overtimeEarning: { type: Number, required: true },
  deductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  presentDays: { type: Number, required: true },
  absentDays: { type: Number, required: true },
  lateMarks: { type: Number, default: 0 },
  lateDeduction: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 }
});

// Composite unique index to avoid multiple salary generation for the same employee and month.
salarySchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
