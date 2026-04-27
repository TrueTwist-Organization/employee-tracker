require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const EmployeeDetail = require('../models/EmployeeDetail');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Salary = require('../models/Salary');
const { getSupabase, requireData } = require('../supabase');

function asId(value) {
  return value?._id ? value._id.toString() : value?.toString();
}

function dateOnly(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function iso(value) {
  return value ? new Date(value).toISOString() : null;
}

async function connectMongoSource() {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    return null;
  }

  const dbPath = path.join(__dirname, '../local_mongo_db');
  if (!fs.existsSync(dbPath)) {
    throw new Error('No MONGO_URI set and backend/local_mongo_db does not exist.');
  }

  const mongoServer = await MongoMemoryServer.create({
    instance: {
      dbPath,
      storageEngine: 'wiredTiger',
    },
  });
  await mongoose.connect(mongoServer.getUri());
  return mongoServer;
}

async function upsert(table, rows) {
  if (!rows.length) return;
  const supabase = getSupabase();
  const result = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  requireData(result.data, result.error);
  console.log(`Migrated ${rows.length} rows into ${table}`);
}

async function run() {
  let mongoServer;
  try {
    mongoServer = await connectMongoSource();
    const users = await User.find().lean();
    const employees = await EmployeeDetail.find().lean();
    const attendance = await Attendance.find().lean();
    const leaves = await Leave.find().lean();
    const salaries = await Salary.find().lean();

    await upsert(
      'users',
      users.map((user) => ({
        id: asId(user._id),
        email: user.email,
        password: user.password,
        role: user.role,
        name: user.name,
      })),
    );

    await upsert(
      'employee_details',
      employees.map((employee) => ({
        id: asId(employee._id),
        user_id: asId(employee.userId),
        phone: employee.phone,
        gender: employee.gender,
        dob: dateOnly(employee.dob),
        address: employee.address,
        profile_photo: employee.profilePhoto || '',
        documents: employee.documents || [],
        basic_salary: employee.basicSalary,
        overtime_rate: employee.overtimeRate || 0,
        designation: employee.designation,
        department: employee.department,
        joining_date: iso(employee.joiningDate) || new Date().toISOString(),
        status: employee.status || 'active',
      })),
    );

    await upsert(
      'attendance',
      attendance.map((record) => ({
        id: asId(record._id),
        user_id: asId(record.userId),
        date: dateOnly(record.date),
        status: record.status,
        time_in: iso(record.timeIn),
        time_out: iso(record.timeOut),
        early_leave: Boolean(record.earlyLeave),
        late_marks: record.lateMarks || 0,
      })),
    );

    await upsert(
      'leaves',
      leaves.map((leave) => ({
        id: asId(leave._id),
        user_id: asId(leave.userId),
        date: dateOnly(leave.date),
        type: leave.type,
        reason: leave.reason,
        status: leave.status || 'pending',
      })),
    );

    await upsert(
      'salaries',
      salaries.map((salary) => ({
        id: asId(salary._id),
        user_id: asId(salary.userId),
        month: salary.month,
        basic_salary: salary.basicSalary,
        basic_earning: salary.basicEarning,
        overtime_earning: salary.overtimeEarning,
        deductions: salary.deductions,
        net_salary: salary.netSalary,
        present_days: salary.presentDays,
        absent_days: salary.absentDays,
        late_marks: salary.lateMarks || 0,
        late_deduction: salary.lateDeduction || 0,
        overtime_hours: salary.overtimeHours || 0,
      })),
    );

    console.log('MongoDB to Supabase migration completed.');
  } finally {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
