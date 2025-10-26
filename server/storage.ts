import { type Lead, type InsertLead } from "@shared/schema";
import { pool } from "./mysql";
import { randomUUID } from "crypto";
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  email: string;
  role: string;
  created_at: Date;
}

export interface SiteSettings {
  id: number;
  logo_path: string | null;
  favicon_path: string | null;
  site_title: string;
  hero_title: string;
  hero_subtitle: string;
  hero_text_1: string;
  hero_text_2: string;
  ebook_path: string | null;
  meta_pixel: string | null;
  google_analytics: string | null;
  google_tag_manager: string | null;
  updated_at: Date;
}

export interface IStorage {
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;

  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: { username: string; password: string; name: string; email: string; role: string }): Promise<User>;
  updateUser(id: number, user: { username?: string; password?: string; name?: string; email?: string; role?: string }): Promise<void>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateLogoPath(logoPath: string): Promise<void>;
  updateFaviconPath(faviconPath: string): Promise<void>;
  updateSiteTitle(siteTitle: string): Promise<void>;
  updateLandingTexts(texts: { hero_title: string; hero_subtitle: string; hero_text_1: string; hero_text_2: string }): Promise<void>;
  updateEbookPath(ebookPath: string): Promise<void>;
  updateScripts(scripts: { meta_pixel?: string; google_analytics?: string; google_tag_manager?: string }): Promise<void>;
}

export class MySQLStorage implements IStorage {
  // Leads
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const createdAt = new Date();
    
    await pool.query(
      'INSERT INTO leads (id, name, email, whatsapp, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, insertLead.name, insertLead.email, insertLead.whatsapp, createdAt]
    );
    
    return { ...insertLead, id, createdAt };
  }

  async getLeads(): Promise<Lead[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM leads ORDER BY created_at DESC');
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      whatsapp: row.whatsapp,
      createdAt: new Date(row.created_at),
    }));
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM leads WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      whatsapp: row.whatsapp,
      createdAt: new Date(row.created_at),
    };
  }

  // Users
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      password_hash: row.password_hash,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at: new Date(row.created_at),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users ORDER BY created_at DESC');
    return rows.map(row => ({
      id: row.id,
      username: row.username,
      password_hash: row.password_hash,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at: new Date(row.created_at),
    }));
  }

  async createUser(user: { username: string; password: string; name: string; email: string; role: string }): Promise<User> {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const createdAt = new Date();

    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, name, email, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, passwordHash, user.name, user.email, user.role, createdAt]
    );

    const insertId = (result as any).insertId;

    return {
      id: insertId,
      username: user.username,
      password_hash: passwordHash,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: createdAt,
    };
  }

  async updateUser(id: number, user: { username?: string; password?: string; name?: string; email?: string; role?: string }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (user.username !== undefined) {
      updates.push('username = ?');
      values.push(user.username);
    }

    if (user.password !== undefined) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (user.name !== undefined) {
      updates.push('name = ?');
      values.push(user.name);
    }

    if (user.email !== undefined) {
      updates.push('email = ?');
      values.push(user.email);
    }

    if (user.role !== undefined) {
      updates.push('role = ?');
      values.push(user.role);
    }

    if (updates.length === 0) {
      return;
    }

    values.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM site_settings LIMIT 1');
    if (rows.length === 0) return undefined;

    const row = rows[0];
    return {
      id: row.id,
      logo_path: row.logo_path,
      favicon_path: row.favicon_path,
      site_title: row.site_title || 'Corteiia',
      hero_title: row.hero_title || '7 Dicas Infalíveis para Lotar sua Agenda de Clientes',
      hero_subtitle: row.hero_subtitle || 'Sua barbearia ou salão está realmente atraindo novos clientes?',
      hero_text_1: row.hero_text_1 || 'Sua barbearia ou salão não pode mais ser reativo. Nós realizamos pesquisas constantes para descobrir o que gera os melhores resultados e o que é perda de tempo, para que você possa ser proativo. Seja para ajustar as estratégias para o próximo semestre ou já planejar o próximo ano, ter o método certo é essencial.',
      hero_text_2: row.hero_text_2 || 'Nossos especialistas compilaram as 7 dicas mais eficazes neste e-book gratuito, focando em criar um serviço de barbearia ou salão que impulsiona os resultados e fideliza clientes.',
      ebook_path: row.ebook_path,
      meta_pixel: row.meta_pixel,
      google_analytics: row.google_analytics,
      google_tag_manager: row.google_tag_manager,
      updated_at: new Date(row.updated_at),
    };
  }

  async updateLogoPath(logoPath: string): Promise<void> {
    await pool.query(
      'UPDATE site_settings SET logo_path = ? WHERE id = 1',
      [logoPath]
    );
  }

  async updateFaviconPath(faviconPath: string): Promise<void> {
    await pool.query(
      'UPDATE site_settings SET favicon_path = ? WHERE id = 1',
      [faviconPath]
    );
  }

  async updateSiteTitle(siteTitle: string): Promise<void> {
    await pool.query(
      'UPDATE site_settings SET site_title = ? WHERE id = 1',
      [siteTitle]
    );
  }

  async updateLandingTexts(texts: { hero_title: string; hero_subtitle: string; hero_text_1: string; hero_text_2: string }): Promise<void> {
    await pool.query(
      'UPDATE site_settings SET hero_title = ?, hero_subtitle = ?, hero_text_1 = ?, hero_text_2 = ? WHERE id = 1',
      [texts.hero_title, texts.hero_subtitle, texts.hero_text_1, texts.hero_text_2]
    );
  }

  async updateEbookPath(ebookPath: string): Promise<void> {
    await pool.query(
      'UPDATE site_settings SET ebook_path = ? WHERE id = 1',
      [ebookPath]
    );
  }

  async updateScripts(scripts: { meta_pixel?: string; google_analytics?: string; google_tag_manager?: string }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (scripts.meta_pixel !== undefined) {
      updates.push('meta_pixel = ?');
      values.push(scripts.meta_pixel);
    }

    if (scripts.google_analytics !== undefined) {
      updates.push('google_analytics = ?');
      values.push(scripts.google_analytics);
    }

    if (scripts.google_tag_manager !== undefined) {
      updates.push('google_tag_manager = ?');
      values.push(scripts.google_tag_manager);
    }

    if (updates.length === 0) {
      return;
    }

    await pool.query(
      `UPDATE site_settings SET ${updates.join(', ')} WHERE id = 1`,
      values
    );
  }
}

export const storage = new MySQLStorage();
