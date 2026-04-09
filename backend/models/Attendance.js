const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  timeIn: { type: Date },
  timeOut: { type: Date },
  earlyLeave: { type: Boolean, default: false },
  lateMarks: { type: Number, default: 0 } // Extra field for penalty if needed.
});

// Composite unique index to prevent duplicate attendance records for the same employee and date.
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
