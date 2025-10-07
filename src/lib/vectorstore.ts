import Database from 'better-sqlite3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';

export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
    page?: number;
    chunk_index: number;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: Document;
  similarity: number;
}

export class VectorStore {
  private db: Database.Database;
  private genAI: GoogleGenerativeAI;
  private embedModel: string;

  constructor() {
    // Chọn thư mục ghi dữ liệu an toàn cho serverless (Vercel/Netlify -> /tmp),
    // ưu tiên biến môi trường RAG_DATA_DIR nếu được cấu hình.
    const isServerless = !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_REGION);
    const defaultLocalDir = path.join(process.cwd(), '.data');
    const dataDir = process.env.RAG_DATA_DIR || (isServerless ? '/tmp' : defaultLocalDir);
    
    // Tạo thư mục .data nếu chưa tồn tại
    try {
      const fs = require('fs');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Could not create .data directory:', error);
    }
    
    const dbPath = path.join(dataDir, 'rag.sqlite');
    console.log('Database path:', dbPath); // Debug log
    this.db = new Database(dbPath);
    
    // Khởi tạo Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.embedModel = process.env.GEMINI_EMBED_MODEL || 'models/text-embedding-004';
    
    // Tạo bảng nếu chưa tồn tại
    this.initDatabase();
  }

  private initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        title TEXT,
        page INTEGER,
        chunk_index INTEGER NOT NULL,
        embedding BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_source ON documents(source);
      CREATE INDEX IF NOT EXISTS idx_chunk_index ON documents(chunk_index);
    `);
  }

  async addDocument(doc: Document): Promise<void> {
    try {
      // Tạo embedding cho document
      const embedding = await this.createEmbedding(doc.content);
      
      // Chuyển embedding thành buffer để lưu trong SQLite
      const embeddingBuffer = Buffer.from(new Float32Array(embedding).buffer);
      
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO documents 
        (id, content, source, title, page, chunk_index, embedding)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        doc.id,
        doc.content,
        doc.metadata.source,
        doc.metadata.title || null,
        doc.metadata.page || null,
        doc.metadata.chunk_index,
        embeddingBuffer
      );
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  async addDocuments(docs: Document[]): Promise<void> {
    const transaction = this.db.transaction((documents: Document[]) => {
      for (const doc of documents) {
        // Tạo embedding đồng bộ trong transaction
        this.addDocumentSync(doc);
      }
    });
    
    // Tạo embeddings trước khi chạy transaction
    for (const doc of docs) {
      if (!doc.embedding) {
        doc.embedding = await this.createEmbedding(doc.content);
      }
    }
    
    transaction(docs);
  }

  private addDocumentSync(doc: Document): void {
    if (!doc.embedding) {
      throw new Error('Document embedding is required for sync operation');
    }
    
    const embeddingBuffer = Buffer.from(new Float32Array(doc.embedding).buffer);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO documents 
      (id, content, source, title, page, chunk_index, embedding)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      doc.id,
      doc.content,
      doc.metadata.source,
      doc.metadata.title || null,
      doc.metadata.page || null,
      doc.metadata.chunk_index,
      embeddingBuffer
    );
  }

  async searchSimilar(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // Tạo embedding cho query
      const queryEmbedding = await this.createEmbedding(query);
      
      // Lấy tất cả documents
      const stmt = this.db.prepare(`
        SELECT id, content, source, title, page, chunk_index, embedding
        FROM documents
      `);
      
      const rows = stmt.all() as any[];
      
      // Tính cosine similarity
      const results: SearchResult[] = [];
      
      for (const row of rows) {
        if (!row.embedding) continue;
        
        // Chuyển buffer thành array
        const docEmbedding = Array.from(new Float32Array(row.embedding));
        
        // Tính cosine similarity
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        
        results.push({
          document: {
            id: row.id,
            content: row.content,
            metadata: {
              source: row.source,
              title: row.title,
              page: row.page,
              chunk_index: row.chunk_index
            }
          },
          similarity
        });
      }
      
      // Sắp xếp theo similarity và trả về top results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error searching similar documents:', error);
      throw error;
    }
  }

  private async createEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.embedModel });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  getDocumentCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM documents');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  getDocumentsBySource(source: string): Document[] {
    const stmt = this.db.prepare(`
      SELECT id, content, source, title, page, chunk_index
      FROM documents
      WHERE source = ?
      ORDER BY chunk_index
    `);
    
    const rows = stmt.all(source) as any[];
    
    return rows.map(row => ({
      id: row.id,
      content: row.content,
      metadata: {
        source: row.source,
        title: row.title,
        page: row.page,
        chunk_index: row.chunk_index
      }
    }));
  }

  deleteDocumentsBySource(source: string): void {
    const stmt = this.db.prepare('DELETE FROM documents WHERE source = ?');
    stmt.run(source);
  }

  close(): void {
    this.db.close();
  }
}
