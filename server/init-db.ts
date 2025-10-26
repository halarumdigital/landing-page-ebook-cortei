import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function initDB() {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '31.97.91.252',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'corteiia_lp',
    password: process.env.MYSQL_PASSWORD || 'ElRn8UGuONJq',
    database: process.env.MYSQL_DATABASE || 'corteiia_lp',
  });
  
  console.log('Connected to MySQL database');
  
  // Criar tabela de leads
  await conn.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(50) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Tabela leads criada/verificada');
  
  // Criar tabela de usuários
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Tabela users criada/verificada');
  
  // Verificar se já existe usuário admin
  const [existingUsers] = await conn.query('SELECT * FROM users WHERE username = ?', ['admin']);
  
  if ((existingUsers as any[]).length === 0) {
    // Criar usuário administrador
    const passwordHash = await bcrypt.hash('admin123', 10);
    await conn.query(
      'INSERT INTO users (username, password_hash, name, email, role) VALUES (?, ?, ?, ?, ?)',
      ['admin', passwordHash, 'Administrador', 'admin@corteiia.com', 'admin']
    );
    console.log('✓ Usuário administrador criado');
    console.log('  Username: admin');
    console.log('  Password: admin123');
  } else {
    console.log('✓ Usuário administrador já existe');
  }
  
  await conn.end();
  console.log('\n✅ Banco de dados inicializado com sucesso!');
}

initDB().catch(console.error);
