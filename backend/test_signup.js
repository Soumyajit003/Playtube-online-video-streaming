import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const testSignup = async () => {
  const formData = new FormData();
  formData.append('fullname', 'Test User ' + Date.now());
  formData.append('username', 'testuser' + Date.now());
  formData.append('email', `test${Date.now()}@example.com`);
  formData.append('password', 'password123');
  
  // We need a dummy file for avatar. Let's create one.
  fs.writeFileSync('./dummy.png', 'dummy content');
  formData.append('avatar', fs.createReadStream('./dummy.png'));

  try {
    const response = await axios.post('http://localhost:8000/api/v1/users/register', formData, {
      headers: formData.getHeaders()
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('ERROR:', error.response.status, error.response.data);
    } else {
      console.log('REQUEST FAILED:', error.message);
    }
  } finally {
    if (fs.existsSync('./dummy.png')) fs.unlinkSync('./dummy.png');
  }
};

testSignup();
