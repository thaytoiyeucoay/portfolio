import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message, forceWeb, allowWeb } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Creating RAGService...'); // Debug log
    const ragService = new RAGService();
    console.log('Querying RAGService...'); // Debug log
    const response = await ragService.query(message, { forceWeb: !!forceWeb, allowWeb: !!allowWeb });

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Chat API error:', error);
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
  return NextResponse.json({
    message: 'Chat API is running',
    endpoints: {
      POST: '/api/chat - Send a message to the chatbot'
    }
  });
}
