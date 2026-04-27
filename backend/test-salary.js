require('dotenv').config();

const { getSupabase, requireData, toDateOnly } = require('./supabase');
const { mapUsersById } = require('./utils/supabaseMappers');

async function test() {
  const supabase = getSupabase();
  const month = "2026-04";
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
  console.log('Start Range:', start.toISOString(), 'End Range:', end.toISOString());

  const employeeResult = await supabase.from('employee_details').select('*').eq('status', 'active');
  const employees = requireData(employeeResult.data, employeeResult.error);
  const userResult = employees.length
    ? await supabase.from('users').select('id,email').in('id', employees.map((employee) => employee.user_id))
    : { data: [], error: null };
  const usersById = mapUsersById(requireData(userResult.data, userResult.error));

  for (const employee of employees) {
    const user = usersById.get(employee.user_id);
    console.log("Employee: ", user?.email, "Basic:", employee.basic_salary);
    const attendanceResult = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', employee.user_id)
      .gte('date', `${month}-01`)
      .lt('date', toDateOnly(end));
    const attendance = requireData(attendanceResult.data, attendanceResult.error);
    console.log(`Found ${attendance.length} records:`, attendance.map(a => a.date));
    const present = attendance.filter(a => a.status === 'present').length;
    console.log(`present count: ${present}`);
  }
  process.exit(0);
}
test();
