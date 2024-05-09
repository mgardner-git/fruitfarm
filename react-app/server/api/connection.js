const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

let connection = null;


const connect = () => {
    if (connection) {
        return connection;
    }else {
        connection =  mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_SCHEMA, 
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, 
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
        return connection;
    }
}
module.exports = {connect}
  