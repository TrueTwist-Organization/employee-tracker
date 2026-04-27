import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@truetwist.com',
      password: 'Admin@123'
    });
    const token = loginRes.data.token;
    console.log('Login successful');

    const form = new FormData();
    form.append('name', 'Test Empl ' + Date.now());
    form.append('email', 'test' + Date.now() + '@example.com');
    form.append('password', 'password');
    form.append('phone', '12345');
    form.append('gender', 'Male');
    form.append('dob', '2000-01-01');
    form.append('address', 'address');
    form.append('basicSalary', '1000');
    form.append('overtimeRate', '0');
    form.append('designation', 'dev');
    form.append('department', 'IT');

    const res = await axios.post('http://localhost:5001/api/employees', form, {
      headers: { 
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('Failed:', err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
test();
