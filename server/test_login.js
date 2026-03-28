const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'manib66@gmail.com',
            password: 'Pardhu#1234'
        });
        console.log('Login Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
