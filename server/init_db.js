const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.query('CREATE DATABASE IF NOT EXISTS `visual_motor_db`;', (err, results) => {
    if (err) {
        console.error('Error creating database:', err);
    } else {
        console.log('Database visual_motor_db created or already exists.');
    }
    connection.end();
});
