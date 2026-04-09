const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const EmployeeDetail = require('./models/EmployeeDetail');
const { calculateSalary } = require('./utils/salaryCalculation');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/minihr').catch(async () => {
     // try the local db path if memory server is using it
  });
  console.log("Connected or not");
  const month = "2026-04";
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
  console.log('Start Range:', start.toISOString(), 'End Range:', end.toISOString());

  const employees = await EmployeeDetail.find({ status: 'active' }).populate('userId');
  for (const employee of employees) {
    console.log("Employee: ", employee.userId?.email, "Basic:", employee.basicSalary);
    const attendance = await Attendance.find({
      userId: employee.userId._id,
      date: { $gte: start, $lt: end }
    });
    console.log(`Found ${attendance.length} records:`, attendance.map(a => a.date.toISOString()));
    const present = attendance.filter(a => a.status === 'present').length;
    console.log(`present count: ${present}`);
  }
  process.exit(0);
}
test();
