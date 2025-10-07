import { NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';
import { DocumentProcessor } from '@/lib/document-processor';
import { getPersonalDataAsText } from '@/lib/personal-data';
export const runtime = 'nodejs';

export async function POST() {
  try {
    console.log('Initializing RAG system...'); // Debug log
    
    const ragService = new RAGService();
    const vectorStore = ragService.getVectorStore();
    const processor = new DocumentProcessor();
    
    console.log('Getting personal data...'); // Debug log
    // Tạo chunks từ dữ liệu cá nhân
    const personalText = getPersonalDataAsText();
    const personalChunks = processor.createTextChunks(personalText, 'personal_info');
    
    console.log('Adding documents to vector store...'); // Debug log
    // Thêm vào vector store
    await vectorStore.addDocuments(personalChunks);
    
    console.log('RAG initialization completed successfully'); // Debug log
    return NextResponse.json({
      success: true,
      message: 'RAG system initialized successfully',
      data: {
        personalDataChunks: personalChunks.length,
        totalDocuments: vectorStore.getDocumentCount()
      }
    });
  } catch (error) {
    console.error('Init API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize RAG system',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Init API endpoint',
    description: 'POST to initialize RAG system with personal data'
  });
}
