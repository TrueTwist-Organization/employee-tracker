const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const { getSupabase, newId, requireData, toDateOnly } = require('../supabase');
const { mapEmployee, mapUsersById } = require('../utils/supabaseMappers');

/** Store `uploads/...` so URLs work on any host after deploy. */
function uploadPublicPath(absPath) {
  if (!absPath) return '';
  const p = String(absPath).replace(/\\/g, '/');
  const idx = p.indexOf('uploads/');
  return idx >= 0 ? p.slice(idx) : p;
}

/** Disk path, or inline data URL on Vercel (memory storage). */
function storedFileRef(file) {
  if (!file) return '';
  if (file.buffer && file.buffer.length) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }
  return uploadPublicPath(file.path);
}

// GET /api/employees - list
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const supabase = getSupabase();
    const employeeResult = await supabase.from('employee_details').select('*').order('created_at', { ascending: false });
    const employees = requireData(employeeResult.data, employeeResult.error);
    const userIds = [...new Set(employees.map((employee) => employee.user_id))];
    const userResult = userIds.length
      ? await supabase.from('users').select('id,name,email,role').in('id', userIds)
      : { data: [], error: null };
    const usersById = mapUsersById(requireData(userResult.data, userResult.error));
    res.json(employees.map((employee) => mapEmployee(employee, usersById.get(employee.user_id))));
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
    const supabase = getSupabase();
    const existingResult = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    const userExists = requireData(existingResult.data, existingResult.error);
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const userId = newId();
    const employeeId = newId();
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await supabase
      .from('users')
      .insert({ id: userId, name, email, password: hashedPassword, role: 'employee' })
      .select('id,name,email,role')
      .single();
    const user = requireData(userResult.data, userResult.error);

    const profilePhoto = (req.files && req.files['profilePhoto'])
      ? storedFileRef(req.files['profilePhoto'][0])
      : '';
    const documents = (req.files && req.files['documentFiles'])
      ? req.files['documentFiles'].map((file) => ({
          title: file.originalname,
          path: storedFileRef(file),
        }))
      : [];

    const employeeResult = await supabase
      .from('employee_details')
      .insert({
        id: employeeId,
        user_id: userId,
        phone,
        gender,
        dob: toDateOnly(dob),
        address,
        profile_photo: profilePhoto,
        documents,
        basic_salary: Number(basicSalary),
        overtime_rate: Number(overtimeRate || 0),
        designation,
        department,
      })
      .select('*')
      .single();
    const employee = requireData(employeeResult.data, employeeResult.error);

    res.status(201).json(mapEmployee(employee, user));
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
    const supabase = getSupabase();
    const currentResult = await supabase.from('employee_details').select('*').eq('id', req.params.id).maybeSingle();
    const employee = requireData(currentResult.data, currentResult.error);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const updates = {};
    const fieldMap = {
      phone: 'phone',
      gender: 'gender',
      dob: 'dob',
      address: 'address',
      basicSalary: 'basic_salary',
      overtimeRate: 'overtime_rate',
      designation: 'designation',
      department: 'department',
      status: 'status',
    };
    for (const [bodyKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[bodyKey] !== undefined) {
        updates[dbKey] = dbKey === 'dob' ? toDateOnly(req.body[bodyKey]) : req.body[bodyKey];
      }
    }
    if (updates.basic_salary !== undefined) updates.basic_salary = Number(updates.basic_salary);
    if (updates.overtime_rate !== undefined) updates.overtime_rate = Number(updates.overtime_rate);
    if (req.files && req.files['profilePhoto']) {
      updates.profile_photo = storedFileRef(req.files['profilePhoto'][0]);
    }
    if (req.files && req.files['documentFiles']) {
      const newDocs = req.files['documentFiles'].map((file) => ({
        title: file.originalname,
        path: storedFileRef(file),
      }));
      updates.documents = [...(employee.documents || []), ...newDocs];
    }

    const updatedResult = await supabase.from('employee_details').update(updates).eq('id', req.params.id).select('*').single();
    const updatedEmployee = requireData(updatedResult.data, updatedResult.error);
    const userResult = await supabase.from('users').select('id,name,email,role').eq('id', updatedEmployee.user_id).single();
    const user = requireData(userResult.data, userResult.error);
    res.json(mapEmployee(updatedEmployee, user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/employees/:userId - profile
router.get('/:userId', protect, async (req, res) => {
  try {
    const supabase = getSupabase();
    const employeeResult = await supabase.from('employee_details').select('*').eq('user_id', req.params.userId).maybeSingle();
    const employee = requireData(employeeResult.data, employeeResult.error);
    if (!employee) return res.status(404).json({ message: 'Profile not found' });
    const userResult = await supabase.from('users').select('id,name,email,role').eq('id', req.params.userId).single();
    const user = requireData(userResult.data, userResult.error);
    res.status(200).json(mapEmployee(employee, user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/employees/:id - delete employee
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const supabase = getSupabase();
    const employeeResult = await supabase.from('employee_details').select('id,user_id').eq('id', req.params.id).maybeSingle();
    const employee = requireData(employeeResult.data, employeeResult.error);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const deleteResult = await supabase.from('users').delete().eq('id', employee.user_id);
    requireData(deleteResult.data, deleteResult.error);

    res.json({ message: 'Employee and associated user account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
