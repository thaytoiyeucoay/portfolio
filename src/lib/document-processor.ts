import { Document } from './vectorstore';
// Parsers are dynamically imported inside methods to avoid SSR build-time side effects

export interface ProcessedDocument {
  chunks: Document[];
  metadata: {
    title: string;
    source: string;
    totalPages?: number;
    fileSize: number;
  };
}

export class DocumentProcessor {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
  }

  async processFile(file: File): Promise<ProcessedDocument> {
    const fileType = file.type;
    const fileName = file.name;
    
    let text: string;
    let totalPages: number | undefined;

    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdfModule = await import('pdf-parse');
      const pdfFn = (pdfModule as any).default || (pdfModule as any);
      const pdfData = await pdfFn(Buffer.from(buffer));
      text = pdfData.text;
      totalPages = pdfData.numpages;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const buffer = await file.arrayBuffer();
      const mammothModule = await import('mammoth');
      const result = await (mammothModule as any).extractRawText({ buffer: Buffer.from(buffer) });
      text = result.value;
    } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
      text = await file.text();
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Chia text thành chunks
    const chunks = this.createChunks(text, fileName);

    return {
      chunks,
      metadata: {
        title: fileName,
        source: fileName,
        totalPages,
        fileSize: file.size
      }
    };
  }

  private createChunks(text: string, source: string): Document[] {
    const chunks: Document[] = [];
    const sentences = this.splitIntoSentences(text);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
      const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
      
      if (potentialChunk.length <= this.chunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push({
            id: `${source}_chunk_${chunkIndex}`,
            content: currentChunk.trim(),
            metadata: {
              source,
              chunk_index: chunkIndex
            }
          });
          chunkIndex++;
        }
        
        // Bắt đầu chunk mới với overlap
        if (this.chunkOverlap > 0 && currentChunk) {
          const words = currentChunk.split(' ');
          const overlapWords = words.slice(-Math.floor(this.chunkOverlap / 5)); // Ước tính 5 ký tự/từ
          currentChunk = overlapWords.join(' ') + ' ' + sentence;
        } else {
          currentChunk = sentence;
        }
      }
    }
    
    // Thêm chunk cuối cùng
    if (currentChunk.trim()) {
      chunks.push({
        id: `${source}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          source,
          chunk_index: chunkIndex
        }
      });
    }
    
    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Làm sạch text
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
    
    // Chia thành câu dựa trên dấu chấm, chấm hỏi, chấm than
    const sentences = cleanText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    return sentences;
  }

  // Tạo chunks cho text thuần túy (không phải file)
  createTextChunks(text: string, source: string): Document[] {
    return this.createChunks(text, source);
  }
}
