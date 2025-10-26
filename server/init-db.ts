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

  // Criar tabela de configurações do site
  await conn.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      logo_path VARCHAR(500),
      favicon_path VARCHAR(500),
      site_title VARCHAR(255) DEFAULT 'Corteiia',
      hero_title VARCHAR(500) DEFAULT '7 Dicas Infalíveis para Lotar sua Agenda de Clientes',
      hero_subtitle VARCHAR(500) DEFAULT 'Sua barbearia ou salão está realmente atraindo novos clientes?',
      hero_text_1 TEXT,
      hero_text_2 TEXT,
      ebook_path VARCHAR(500),
      meta_pixel TEXT,
      google_analytics TEXT,
      google_tag_manager TEXT,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Tabela site_settings criada/verificada');

  // Verificar se já existe registro de configurações
  const [existingSettings] = await conn.query('SELECT * FROM site_settings');

  if ((existingSettings as any[]).length === 0) {
    // Criar registro inicial de configurações
    await conn.query(
      `INSERT INTO site_settings (logo_path, favicon_path, site_title, hero_title, hero_subtitle, hero_text_1, hero_text_2)
       VALUES (NULL, NULL, "Corteiia",
               "7 Dicas Infalíveis para Lotar sua Agenda de Clientes",
               "Sua barbearia ou salão está realmente atraindo novos clientes?",
               "Sua barbearia ou salão não pode mais ser reativo. Nós realizamos pesquisas constantes para descobrir o que gera os melhores resultados e o que é perda de tempo, para que você possa ser proativo. Seja para ajustar as estratégias para o próximo semestre ou já planejar o próximo ano, ter o método certo é essencial.",
               "Nossos especialistas compilaram as 7 dicas mais eficazes neste e-book gratuito, focando em criar um serviço de barbearia ou salão que impulsiona os resultados e fideliza clientes.")`
    );
    console.log('✓ Registro de configurações criado');
  } else {
    console.log('✓ Registro de configurações já existe');
  }

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
