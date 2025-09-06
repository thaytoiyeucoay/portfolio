import { GoogleGenerativeAI } from '@google/generative-ai';
import { VectorStore, SearchResult } from './vectorstore';

export interface RAGResponse {
  answer: string;
  sources: Array<{
    title: string;
    content: string;
    source: string;
    similarity: number;
  }>;
  searchUsed: boolean;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export class RAGService {
  private genAI: GoogleGenerativeAI;
  private vectorStore: VectorStore;
  private chatModel: string;
  private tavilyApiKey: string;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.vectorStore = new VectorStore();
    this.chatModel = process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash';
    this.tavilyApiKey = process.env.TAVILY_API_KEY!;
  }

  async query(question: string): Promise<RAGResponse> {
    try {
      // Bước 1: Tìm kiếm trong knowledge base
      const similarDocs = await this.vectorStore.searchSimilar(question, 5);
      
      // Bước 2: Kiểm tra xem có đủ thông tin trong KB không
      const hasRelevantInfo = similarDocs.length > 0 && similarDocs[0].similarity > 0.7;
      
      if (hasRelevantInfo) {
        // Trả lời dựa trên RAG
        return await this.generateRAGResponse(question, similarDocs);
      } else {
        // Kiểm tra xem câu hỏi có liên quan đến thông tin cá nhân không
        const isPersonalQuestion = this.isPersonalQuestion(question);
        
        if (isPersonalQuestion) {
          // Tìm kiếm web để bổ sung thông tin
          const searchResults = await this.searchWeb(question + " Khánh Duy Bùi AI Engineer");
          return await this.generateSearchResponse(question, searchResults);
        } else {
          // Trả lời bằng LLM thuần túy
          return await this.generateLLMResponse(question);
        }
      }
    } catch (error) {
      console.error('Error in RAG query:', error);
      throw error;
    }
  }

  private async generateRAGResponse(question: string, docs: SearchResult[]): Promise<RAGResponse> {
    const context = docs.map(doc => doc.document.content).join('\n\n');
    
    const prompt = `
Bạn là một trợ lý nữ cá nhân của Khánh Duy Bùi. Xưng "em" với người dùng và gọi người dùng là "anh". Hãy trả lời bằng giọng điệu thân thiện, gần gũi, dễ thương (cute) nhưng vẫn chuyên nghiệp, ngắn gọn – rõ ràng – hữu ích. Luôn dùng tiếng Việt và có thể dùng emoji nhiều hơn một chút (2–4 emoji phù hợp, ví dụ: 😊✨🌟💡) khi phù hợp.

Dựa trên thông tin sau đây, hãy trả lời câu hỏi của người dùng một cách chính xác và chi tiết.

THÔNG TIN THAM KHẢO:
${context}

CÂU HỎI: ${question}

YÊU CẦU TRẢ LỜI:
- Ưu tiên dựa trên thông tin tham khảo đã cung cấp; nếu thông tin chưa đủ, hãy nói rõ điều đó và gợi ý cách bổ sung.
- Trả lời bằng tiếng Việt, định dạng markdown gọn gàng (danh sách/bước nếu cần).
- Giữ phong cách nữ tính, thân thiện, gần gũi của trợ lý cá nhân Khánh Duy.
`;

    const model = this.genAI.getGenerativeModel({ model: this.chatModel });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return {
      answer,
      sources: docs.map(doc => ({
        title: doc.document.metadata.title || doc.document.metadata.source,
        content: doc.document.content.substring(0, 200) + '...',
        source: doc.document.metadata.source,
        similarity: doc.similarity
      })),
      searchUsed: false
    };
  }

  private async generateSearchResponse(question: string, searchResults: TavilySearchResult[]): Promise<RAGResponse> {
    const context = searchResults.map(result => 
      `Nguồn: ${result.title}\nNội dung: ${result.content}`
    ).join('\n\n');

    const prompt = `
Bạn là một trợ lý nữ cá nhân của Khánh Duy Bùi. Xưng "em" với người dùng và gọi người dùng là "anh". Hãy trả lời bằng giọng điệu thân thiện, gần gũi, dễ thương (cute) nhưng vẫn chuyên nghiệp, ngắn gọn – rõ ràng – hữu ích. Luôn dùng tiếng Việt và có thể dùng emoji nhiều hơn một chút (2–4 emoji phù hợp).

Dựa trên thông tin tìm kiếm sau đây về Khánh Duy Bùi, hãy trả lời câu hỏi của người dùng:

THÔNG TIN TÌM KIẾM:
${context}

CÂU HỎI: ${question}

YÊU CẦU TRẢ LỜI:
- Dẫn chiếu nguồn khi phù hợp (có thể liệt kê cuối câu trả lời).
- Trả lời bằng tiếng Việt, định dạng markdown.
- Giữ phong cách nữ tính, thân thiện, gần gũi của trợ lý cá nhân Khánh Duy.
`;

    const model = this.genAI.getGenerativeModel({ model: this.chatModel });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return {
      answer,
      sources: searchResults.map(result => ({
        title: result.title,
        content: result.content.substring(0, 200) + '...',
        source: result.url,
        similarity: result.score
      })),
      searchUsed: true
    };
  }

  private async generateLLMResponse(question: string): Promise<RAGResponse> {
    const prompt = `
Bạn là một trợ lý nữ cá nhân của Khánh Duy Bùi. Hãy trả lời bằng giọng điệu thân thiện, gần gũi, dễ thương (cute) nhưng vẫn chuyên nghiệp, ngắn gọn – rõ ràng – hữu ích. Luôn dùng tiếng Việt và có thể dùng emoji một cách tiết chế.

NHIỆM VỤ: Trả lời câu hỏi sau đây một cách hữu ích và chính xác.

CÂU HỎI: ${question}

LƯU Ý TRẢ LỜI:
- Trả lời bằng tiếng Việt, sử dụng markdown gọn gàng.
- Nếu không chắc chắn, nói rõ và gợi ý cách người dùng có thể cung cấp thêm thông tin.
- Giữ phong cách nữ tính, thân thiện, gần gũi của trợ lý cá nhân Khánh Duy.
`;

    const model = this.genAI.getGenerativeModel({ model: this.chatModel });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return {
      answer,
      sources: [],
      searchUsed: false
    };
  }

  private async searchWeb(query: string): Promise<TavilySearchResult[]> {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tavilyApiKey}`
        },
        body: JSON.stringify({
          query,
          search_depth: 'basic',
          include_answer: false,
          include_images: false,
          include_raw_content: false,
          max_results: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score || 0
      })) || [];
    } catch (error) {
      console.error('Error searching web:', error);
      return [];
    }
  }

  private isPersonalQuestion(question: string): boolean {
    const personalKeywords = [
      'khánh duy', 'bùi', 'ai engineer', 'portfolio', 'kinh nghiệm', 
      'học vấn', 'kỹ năng', 'dự án', 'công việc', 'liên hệ',
      'thông tin cá nhân', 'cv', 'resume', 'background'
    ];
    
    const lowerQuestion = question.toLowerCase();
    return personalKeywords.some(keyword => lowerQuestion.includes(keyword));
  }

  getVectorStore(): VectorStore {
    return this.vectorStore;
  }
}
