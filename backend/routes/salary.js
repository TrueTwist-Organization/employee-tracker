const express = require('express');
const router = express.Router();
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { protect, adminOnly } = require('../middleware/auth');
const EmployeeDetail = require('../models/EmployeeDetail');
const Attendance = require('../models/Attendance');
const Salary = require('../models/Salary');
const { calculateSalary } = require('../utils/salaryCalculation');

router.get('/debug', process.env.NODE_ENV === 'development' ? async (req, res) => {
  try {
    const month = "2026-04";
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
    const daysInMonth = (end - start) / (1000 * 60 * 60 * 24);
    const employees = await EmployeeDetail.find({ status: 'active' }).populate('userId');
    let out = [];
    for (const employee of employees) {
      if (!employee.userId) continue;
      const attendance = await Attendance.find({
        userId: employee.userId._id,
        date: { $gte: start, $lt: end }
      });
      const present = attendance.filter(a => a.status === 'present').length;
      out.push({
        email: employee.userId.email,
        basicSalary: employee.basicSalary,
        records: attendance.map(a => ({date: a.date.toISOString(), status: a.status})),
        presentCount: present,
        daysInMonth: daysInMonth
      });
    }
    res.json(out);
  } catch (error) { res.status(500).json({ error: error.message }); }
} : (req, res) => res.json('ok'));

// POST /api/salary/:month/generate - auto-generate for all active employees
router.post('/:month/generate', protect, adminOnly, async (req, res) => {
  const { month } = req.params; // format: YYYY-MM
  try {
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
    const daysInMonth = (end - start) / (1000 * 60 * 60 * 24);

    console.log('[SALARY DEBUG] Generating for month:', month);
    console.log('[SALARY DEBUG] Start Range:', start.toISOString(), 'End Range:', end.toISOString());
    const employees = await EmployeeDetail.find({ status: 'active' }).populate('userId');

    for (const employee of employees) {
      const attendance = await Attendance.find({
        userId: employee.userId._id,
        date: { $gte: start, $lt: end }
      });
      console.log(`[SALARY DEBUG] Found ${attendance.length} attendance records for employee ${employee.userId.email}`);
      console.log(`[SALARY DEBUG] Records output:`, attendance.map(a => a.date.toISOString()));

      const present = attendance.filter(a => a.status === 'present').length;
      const absent = daysInMonth - present; // Or based on weekend logic, but simple days-present
      console.log(`[SALARY DEBUG] present count: ${present}, absent: ${absent}`);

      const lateMarks = attendance.reduce((sum, a) => sum + (a.lateMarks || 0), 0);
      const overtimeHours = 0; // In a real app, track overtime too.

      const results = calculateSalary(employee, { present, absent: Math.max(0, absent) }, overtimeHours, lateMarks, Math.round(daysInMonth));
      console.log(`[SALARY DEBUG] Calc Results = `, results);

      await Salary.findOneAndUpdate(
        { userId: employee.userId._id, month },
        { userId: employee.userId._id, month, ...results },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Salaries generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/salary/:month - list salaries for that month
router.get('/:month', protect, async (req, res) => {
  const { month } = req.params;
  try {
    const query = { month };
    if (req.user.role === 'employee') query.userId = req.user._id;

    const data = await Salary.find(query).populate('userId', 'name role email');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/salary/:id/pdf - generate PDF salary slip
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate('userId', 'name email');
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    // Authorization check: Admin or the employee itself
    if (req.user.role !== 'admin' && req.user._id.toString() !== salary.userId._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('MiniHR - Salary Slip', { x: 50, y: 350, size: 24, font: fontBold, color: rgb(0.2, 0.4, 0.8) });
    page.drawText(`Employee: ${salary.userId.name}`, { x: 50, y: 310, size: 14, font });
    page.drawText(`Email: ${salary.userId.email}`, { x: 50, y: 290, size: 12, font });
    page.drawText(`Month: ${salary.month}`, { x: 50, y: 270, size: 12, font });

    let y = 230;
    page.drawRectangle({ x: 50, y: 220, width: 500, height: 2, color: rgb(0.8, 0.8, 0.8) });
    
    page.drawText(`Basic Salary: ${salary.basicSalary}`, { x: 50, y: 200, size: 12, font });
    page.drawText(`Present Days: ${salary.presentDays}`, { x: 250, y: 200, size: 12, font });
    page.drawText(`Absent Days: ${salary.absentDays}`, { x: 400, y: 200, size: 12, font });
    
    page.drawText(`Earnings: ₹${salary.basicEarning}`, { x: 50, y: 175, size: 12, font });
    page.drawText(`Overtime: ₹${salary.overtimeEarning}`, { x: 250, y: 175, size: 12, font });

    page.drawText(`Late Marks: ${salary.lateMarks || 0}`, { x: 50, y: 150, size: 12, font });
    page.drawText(`Late Deduction: ₹${salary.lateDeduction || 0}`, { x: 250, y: 150, size: 12, font });
    
    page.drawText(`Total Deductions: ₹${salary.deductions}`, { x: 50, y: 125, size: 12, font, color: rgb(0.8, 0.2, 0.2) });

    page.drawRectangle({ x: 50, y: 120, width: 500, height: 1, color: rgb(0, 0, 0) });
    page.drawText(`Net Salary: ${salary.netSalary}`, { x: 50, y: 100, size: 16, font: fontBold, color: rgb(0.2, 0.6, 0.2) });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=salary-slip-${salary.userId.name}-${salary.month}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
