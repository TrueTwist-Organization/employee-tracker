function toNumber(value) {
  if (value === null || value === undefined || value === '') return value;
  return Number(value);
}

function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

function mapEmployee(row, userRow) {
  if (!row) return null;
  const user = userRow || row.user || row.users;
  return {
    _id: row.id,
    userId: mapUser(user),
    phone: row.phone,
    gender: row.gender,
    dob: row.dob,
    address: row.address,
    profilePhoto: row.profile_photo || '',
    documents: row.documents || [],
    basicSalary: toNumber(row.basic_salary),
    overtimeRate: toNumber(row.overtime_rate),
    designation: row.designation,
    department: row.department,
    joiningDate: row.joining_date,
    status: row.status,
  };
}

function mapAttendance(row, userRow) {
  if (!row) return null;
  const user = userRow || row.user || row.users;
  return {
    _id: row.id,
    userId: user ? mapUser(user) : row.user_id,
    date: row.date,
    status: row.status,
    timeIn: row.time_in,
    timeOut: row.time_out,
    earlyLeave: Boolean(row.early_leave),
    lateMarks: Number(row.late_marks || 0),
  };
}

function mapLeave(row, userRow) {
  if (!row) return null;
  const user = userRow || row.user || row.users;
  return {
    _id: row.id,
    userId: user ? mapUser(user) : row.user_id,
    date: row.date,
    type: row.type,
    reason: row.reason,
    status: row.status,
  };
}

function mapSalary(row, userRow) {
  if (!row) return null;
  const user = userRow || row.user || row.users;
  return {
    _id: row.id,
    userId: user ? mapUser(user) : row.user_id,
    month: row.month,
    basicSalary: toNumber(row.basic_salary),
    basicEarning: toNumber(row.basic_earning),
    overtimeEarning: toNumber(row.overtime_earning),
    deductions: toNumber(row.deductions),
    netSalary: toNumber(row.net_salary),
    presentDays: Number(row.present_days || 0),
    absentDays: Number(row.absent_days || 0),
    lateMarks: Number(row.late_marks || 0),
    lateDeduction: toNumber(row.late_deduction || 0),
    overtimeHours: toNumber(row.overtime_hours || 0),
  };
}

function mapUsersById(rows = []) {
  return new Map(rows.map((row) => [row.id, row]));
}

module.exports = {
  mapAttendance,
  mapEmployee,
  mapLeave,
  mapSalary,
  mapUser,
  mapUsersById,
};
