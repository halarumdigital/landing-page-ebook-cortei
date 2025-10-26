import mysql from 'mysql2/promise';

async function checkDB() {
  const conn = await mysql.createConnection({
    host: '31.97.91.252',
    port: 3306,
    user: 'corteiia_lp',
    password: 'ElRn8UGuONJq',
    database: 'corteiia_lp',
  });
  
  console.log('Connected to MySQL database');
  
  const [tables] = await conn.query('SHOW TABLES');
  console.log('\nTables:', tables);
  
  for (const table of tables as any[]) {
    const tableName = Object.values(table)[0];
    const [columns] = await conn.query(`DESCRIBE ${tableName}`);
    console.log(`\nStructure of ${tableName}:`, columns);
  }
  
  await conn.end();
}

checkDB().catch(console.error);
