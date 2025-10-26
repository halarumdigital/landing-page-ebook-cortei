import { type Lead, type InsertLead } from "@shared/schema";
import { pool } from "./mysql";
import { randomUUID } from "crypto";
import type { RowDataPacket } from 'mysql2';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  email: string;
  role: string;
  created_at: Date;
}

export interface IStorage {
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLeadById(id: string): Promise<Lead | undefined>;
  
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
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
}

export const storage = new MySQLStorage();
