const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'visual_motor_db'
});
connection.query('DESCRIBE users', (err, results) => {
    if (err) console.error(err);
    else console.log(results.map(r => r.Field));
    connection.end();
});
