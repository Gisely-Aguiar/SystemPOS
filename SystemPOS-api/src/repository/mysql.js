//src/database/mysql.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "bvqpliqqqlrqktpge3gv-mysql.services.clever-cloud.com",
    database: "bvqpliqqqlrqktpge3gv",
    user: "ugtdgbbest6dbnmy",
    password: "sUJMe4MnxgfZo0hOZb2h",
    port: 3306,
    connectionLimit: 3
});

async function connectDB() {
    const connection = await pool.getConnection();
    
    // Substitui o método .end() por .release() para compatibilidade
    const originalEnd = connection.end.bind(connection);
    connection.end = async () => {
        connection.release(); // ⬅️ Usa release() em vez de end()
        return Promise.resolve();
    };
    
    return connection;
}

export default { connectDB };





// // // src/database/mysql.js
// import mysql from "mysql2/promise";

// async function connectDB() {
//     return await mysql.createConnection({
//         // host: "bvqpliqqqlrqktpge3gv-mysql.services.clever-cloud.com",
//         // database: "bvqpliqqqlrqktpge3gv",
//         // user: "ugtdgbbest6dbnmy",
//         // password: "sUJMe4MnxgfZo0hOZb2h",
//         // port: 3306,

//         password: "etecembu@123",
//         host: "localhost",
//         user: "root",
//         port: 3306,
//         database: "systemPos"
//     });
// }

// export default {connectDB};











// Testar as APIs
// Abra o Postman ou Insomnia.
// Teste os endpoints:
// GET http://localhost:3333/relatorio?tipo=Vendas&periodo=Semana&empresaId=1
// GET http://localhost:3333/relatorio/pdf?tipo=Vendas&periodo=Semana&empresaId=1&usuarioId=1
// Veja se os dados são retornados corretamente ou se o PDF é baixado.