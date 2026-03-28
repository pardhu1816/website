const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://14.139.187.229:8015//api/auth/login', {
            email: 'manib66@gmail.com',
            password: 'Pardhu#1234'
        });
        console.log('Login Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
