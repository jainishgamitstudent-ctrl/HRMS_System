async function test() {
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jainishgamit374@gmail.com', password: 'password123' })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.token || (loginData.data && loginData.data.token);
  if (!token) {
     console.log("No token:", loginData);
     return;
  }
  
  const payrollRes = await fetch('http://localhost:3000/api/v1/employee/payroll/current', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  console.log("Current status:", payrollRes.status);
  console.log("Current body:", await payrollRes.json());
}
test();
