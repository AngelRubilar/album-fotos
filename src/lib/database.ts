// Implementación temporal usando SQLite directo
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Crear tabla de álbumes si no existe
    this.db.run(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        year INTEGER UNIQUE,
        title TEXT,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de imágenes si no existe
    this.db.run(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        albumId TEXT,
        filename TEXT,
        originalName TEXT,
        fileUrl TEXT,
        thumbnailUrl TEXT,
        fileSize INTEGER,
        width INTEGER,
        height INTEGER,
        mimeType TEXT,
        description TEXT,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (albumId) REFERENCES albums (id) ON DELETE CASCADE
      )
    `);
  }

  async createAlbum(data: { year: number; title: string; description?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.db.run(
        'INSERT INTO albums (id, year, title, description) VALUES (?, ?, ?, ?)',
        [id, data.year, data.title, data.description || ''],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...data });
        }
      );
    });
  }

  async getAlbums(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT a.*, COUNT(i.id) as imageCount 
         FROM albums a 
         LEFT JOIN images i ON a.id = i.albumId 
         GROUP BY a.id 
         ORDER BY a.year DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async getAlbumById(id: string) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT a.*, COUNT(i.id) as imageCount 
         FROM albums a 
         LEFT JOIN images i ON a.id = i.albumId 
         WHERE a.id = ? 
         GROUP BY a.id`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async getAlbumByYear(year: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM albums WHERE year = ?',
        [year],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async deleteAlbum(id: string) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM albums WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ id });
        }
      );
    });
  }

  async createImage(data: {
    albumId: string;
    filename: string;
    originalName: string;
    fileUrl: string;
    thumbnailUrl?: string;
    fileSize: number;
    width: number;
    height: number;
    mimeType: string;
    description?: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.db.run(
        `INSERT INTO images (id, albumId, filename, originalName, fileUrl, thumbnailUrl, fileSize, width, height, mimeType, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, data.albumId, data.filename, data.originalName, data.fileUrl,
          data.thumbnailUrl || '', data.fileSize, data.width, data.height,
          data.mimeType, data.description || ''
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...data });
        }
      );
    });
  }

  async getImagesByAlbumYear(year: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT i.* FROM images i 
         JOIN albums a ON i.albumId = a.id 
         WHERE a.year = ? 
         ORDER BY i.uploadedAt DESC`,
        [year],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

// Instancia singleton
let dbInstance: Database | null = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}
