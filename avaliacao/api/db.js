
const mysql = require("mysql2/promise");

const conexao = mysql.createPool({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "produtos_user",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "produtos_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = conexao;
