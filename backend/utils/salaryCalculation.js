const calculateSalary = (employee, attendanceCount, overtimeHours, lateMarks, daysInMonth = 30) => {
  const { basicSalary, overtimeRate } = employee;
  const basicPerDay = basicSalary / daysInMonth;

  const presentDays = attendanceCount.present;
  const absentDays = attendanceCount.absent;

  const basicEarning = presentDays * basicPerDay;
  const overtimeEarning = overtimeHours * overtimeRate;
  
  const latePenalty = 100; // Let's set 100 per late mark.
  const lateDeduction = lateMarks * latePenalty;
  
  // Total deductions = absent days deduction for display + late penalty
  const deductions = (absentDays * basicPerDay) + lateDeduction;

  // Since basicEarning already only accounts for present days, 
  // the net salary is simply basicEarning + overtimeEarning - lateDeduction.
  const netSalary = Math.max(0, basicEarning + overtimeEarning - lateDeduction);

  return {
    basicEarning: parseFloat(basicEarning.toFixed(2)),
    overtimeEarning: parseFloat(overtimeEarning.toFixed(2)),
    deductions: parseFloat(deductions.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
    presentDays,
    absentDays,
    overtimeHours,
    lateMarks,
    lateDeduction: parseFloat(lateDeduction.toFixed(2)),
    basicSalary
  };
};

module.exports = { calculateSalary };
