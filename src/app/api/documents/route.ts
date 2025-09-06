import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessor } from '@/lib/document-processor';
import { RAGService } from '@/lib/rag-service';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const ragService = new RAGService();
    const vectorStore = ragService.getVectorStore();
    const processor = new DocumentProcessor();
    
    const results = [];
    
    for (const file of files) {
      try {
        // Xử lý file thành chunks
        const processedDoc = await processor.processFile(file);
        
        // Thêm vào vector store
        await vectorStore.addDocuments(processedDoc.chunks);
        
        results.push({
          filename: file.name,
          chunks: processedDoc.chunks.length,
          metadata: processedDoc.metadata,
          success: true
        });
      } catch (error) {
        results.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: results,
        totalDocuments: vectorStore.getDocumentCount()
      }
    });
  } catch (error) {
    console.error('Document upload API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ragService = new RAGService();
    const vectorStore = ragService.getVectorStore();
    
    return NextResponse.json({
      success: true,
      data: {
        totalDocuments: vectorStore.getDocumentCount(),
        message: 'Document API is running'
      }
    });
  } catch (error) {
    console.error('Document API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source parameter is required' },
        { status: 400 }
      );
    }

    const ragService = new RAGService();
    const vectorStore = ragService.getVectorStore();
    
    vectorStore.deleteDocumentsBySource(source);
    
    return NextResponse.json({
      success: true,
      message: `Documents from source '${source}' deleted successfully`,
      totalDocuments: vectorStore.getDocumentCount()
    });
  } catch (error) {
    console.error('Document delete API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
