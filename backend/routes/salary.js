const express = require('express');
const router = express.Router();
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { protect, adminOnly } = require('../middleware/auth');
const { getSupabase, newId, requireData, toDateOnly } = require('../supabase');
const { mapEmployee, mapSalary, mapUsersById } = require('../utils/supabaseMappers');
const { calculateSalary } = require('../utils/salaryCalculation');

router.get('/debug', process.env.NODE_ENV === 'development' ? async (req, res) => {
  try {
    const supabase = getSupabase();
    const month = "2026-04";
    const startDate = new Date(`${month}-01T00:00:00`);
    const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
    const daysInMonth = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const employeeResult = await supabase.from('employee_details').select('*').eq('status', 'active');
    const employees = requireData(employeeResult.data, employeeResult.error);
    const userIds = [...new Set(employees.map((employee) => employee.user_id))];
    const userResult = userIds.length
      ? await supabase.from('users').select('id,email').in('id', userIds)
      : { data: [], error: null };
    const users = requireData(userResult.data, userResult.error);
    const usersById = mapUsersById(users);
    let out = [];
    for (const employee of employees) {
      const user = usersById.get(employee.user_id);
      if (!user) continue;
      const attendanceResult = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', employee.user_id)
        .gte('date', `${month}-01`)
        .lt('date', toDateOnly(endDate));
      const attendance = requireData(attendanceResult.data, attendanceResult.error);
      const present = attendance.filter(a => a.status === 'present').length;
      out.push({
        email: user.email,
        basicSalary: employee.basic_salary,
        records: attendance.map(a => ({date: a.date, status: a.status})),
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
    const supabase = getSupabase();
    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
    const daysInMonth = (end - start) / (1000 * 60 * 60 * 24);

    console.log('[SALARY DEBUG] Generating for month:', month);
    console.log('[SALARY DEBUG] Start Range:', start.toISOString(), 'End Range:', end.toISOString());
    const employeeResult = await supabase.from('employee_details').select('*').eq('status', 'active');
    const employees = requireData(employeeResult.data, employeeResult.error);
    const userIds = [...new Set(employees.map((employee) => employee.user_id))];
    const userResult = userIds.length
      ? await supabase.from('users').select('id,name,email,role').in('id', userIds)
      : { data: [], error: null };
    const usersById = mapUsersById(requireData(userResult.data, userResult.error));

    for (const employee of employees) {
      const user = usersById.get(employee.user_id);
      if (!user) continue;
      const attendanceResult = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', employee.user_id)
        .gte('date', `${month}-01`)
        .lt('date', toDateOnly(end));
      const attendance = requireData(attendanceResult.data, attendanceResult.error);
      console.log(`[SALARY DEBUG] Found ${attendance.length} attendance records for employee ${user.email}`);
      console.log(`[SALARY DEBUG] Records output:`, attendance.map(a => a.date));

      const present = attendance.filter(a => a.status === 'present').length;
      const absent = daysInMonth - present; // Or based on weekend logic, but simple days-present
      console.log(`[SALARY DEBUG] present count: ${present}, absent: ${absent}`);

      const lateMarks = attendance.reduce((sum, a) => sum + (a.late_marks || 0), 0);
      const overtimeHours = 0; // In a real app, track overtime too.

      const results = calculateSalary(mapEmployee(employee, user), { present, absent: Math.max(0, absent) }, overtimeHours, lateMarks, Math.round(daysInMonth));
      console.log(`[SALARY DEBUG] Calc Results = `, results);

      const existingResult = await supabase
        .from('salaries')
        .select('id')
        .eq('user_id', employee.user_id)
        .eq('month', month)
        .maybeSingle();
      const existing = requireData(existingResult.data, existingResult.error);
      const payload = {
        user_id: employee.user_id,
        month,
        basic_salary: results.basicSalary,
        basic_earning: results.basicEarning,
        overtime_earning: results.overtimeEarning,
        deductions: results.deductions,
        net_salary: results.netSalary,
        present_days: results.presentDays,
        absent_days: results.absentDays,
        late_marks: results.lateMarks,
        late_deduction: results.lateDeduction,
        overtime_hours: results.overtimeHours,
      };
      const writeResult = existing
        ? await supabase.from('salaries').update(payload).eq('id', existing.id)
        : await supabase.from('salaries').insert({ id: newId(), ...payload });
      requireData(writeResult.data, writeResult.error);
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
    const supabase = getSupabase();
    let query = supabase.from('salaries').select('*').eq('month', month);
    if (req.user.role === 'employee') query = query.eq('user_id', req.user._id);

    const salaryResult = await query;
    const salaries = requireData(salaryResult.data, salaryResult.error);
    const userIds = [...new Set(salaries.map((salary) => salary.user_id))];
    const userResult = userIds.length
      ? await supabase.from('users').select('id,name,email,role').in('id', userIds)
      : { data: [], error: null };
    const usersById = mapUsersById(requireData(userResult.data, userResult.error));
    res.json(salaries.map((salary) => mapSalary(salary, usersById.get(salary.user_id))));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/salary/:id/pdf - generate PDF salary slip
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const supabase = getSupabase();
    const salaryResult = await supabase.from('salaries').select('*').eq('id', req.params.id).maybeSingle();
    const rawSalary = requireData(salaryResult.data, salaryResult.error);
    if (!rawSalary) return res.status(404).json({ message: 'Salary record not found' });
    const userResult = await supabase.from('users').select('id,name,email,role').eq('id', rawSalary.user_id).single();
    const user = requireData(userResult.data, userResult.error);
    const salary = mapSalary(rawSalary, user);
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    // Authorization check: Admin or the employee itself
    if (req.user.role !== 'admin' && req.user._id !== rawSalary.user_id) {
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
