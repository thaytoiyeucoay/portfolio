# Chatbot RAG - Hướng dẫn sử dụng

## Tổng quan
Chatbot RAG (Retrieval-Augmented Generation) được tích hợp vào portfolio của Khánh Duy Bùi, sử dụng Gemini AI và vector search để trả lời câu hỏi dựa trên knowledge base cục bộ.

## Tính năng chính

### 1. RAG (Retrieval-Augmented Generation)
- Trả lời câu hỏi dựa trên tài liệu đã tải lên
- Sử dụng Gemini text-embedding-004 để tạo vector embeddings
- Lưu trữ vector cục bộ với SQLite
- Tìm kiếm semantic similarity để tìm thông tin liên quan

### 2. Tích hợp tìm kiếm web
- Sử dụng Tavily API để tìm kiếm Google
- Tự động fallback sang web search khi không có thông tin trong KB
- Ưu tiên tìm kiếm thông tin về Khánh Duy Bùi

### 3. LLM Chat
- Sử dụng Gemini 1.5 Flash/Pro cho chat
- Fallback sang LLM thuần túy khi không tìm thấy thông tin liên quan

## Cấu hình môi trường

Tạo file `.env.local` với các biến môi trường sau:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBED_MODEL=models/text-embedding-004
GEMINI_CHAT_MODEL=gemini-1.5-flash

# Tavily Search API
TAVILY_API_KEY=your_tavily_api_key
```

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
npm install
```

2. Khởi động development server:
```bash
npm run dev
```

3. Truy cập chatbot tại: `http://localhost:3000/chatbot-rag`

## API Endpoints

### 1. POST /api/init
Khởi tạo hệ thống RAG với dữ liệu cá nhân
```json
{
  "success": true,
  "message": "RAG system initialized successfully",
  "data": {
    "personalDataChunks": 15,
    "totalDocuments": 15
  }
}
```

### 2. POST /api/chat
Gửi tin nhắn đến chatbot
```json
{
  "message": "Khánh Duy có kinh nghiệm gì về AI?"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "Khánh Duy Bùi có kinh nghiệm phong phú về AI...",
    "sources": [...],
    "searchUsed": false
  }
}
```

### 3. POST /api/documents
Upload tài liệu để thêm vào knowledge base
```bash
curl -X POST -F "files=@document.pdf" http://localhost:3000/api/documents
```

### 4. DELETE /api/documents?source=filename
Xóa tài liệu khỏi knowledge base

## Cách sử dụng

### 1. Khởi tạo hệ thống
- Hệ thống tự động khởi tạo khi truy cập trang chatbot
- Dữ liệu cá nhân về Khánh Duy Bùi được tự động thêm vào KB

### 2. Upload tài liệu
- Hỗ trợ PDF, DOCX, TXT, Markdown
- Tài liệu được chia thành chunks và tạo embeddings
- Hiển thị trạng thái upload real-time

### 3. Chat với bot
- Đặt câu hỏi về thông tin trong tài liệu
- Bot sẽ tìm kiếm thông tin liên quan và trả lời
- Hiển thị nguồn trích dẫn cho mỗi câu trả lời

### 4. Tính năng nâng cao
- Text-to-Speech cho câu trả lời
- Copy tin nhắn và code blocks
- Markdown rendering với syntax highlighting
- Responsive design

## Kiến trúc hệ thống

```
Frontend (Next.js)
├── /chatbot-rag (UI)
├── /api/chat (Chat endpoint)
├── /api/documents (Document management)
└── /api/init (System initialization)

Backend Services
├── VectorStore (SQLite + embeddings)
├── DocumentProcessor (PDF/DOCX/TXT parsing)
├── RAGService (Query processing)
└── External APIs (Gemini AI, Tavily Search)
```

## Troubleshooting

### Lỗi thường gặp

1. **"Failed to initialize RAG system"**
   - Kiểm tra GEMINI_API_KEY trong .env.local
   - Đảm bảo thư mục .data tồn tại

2. **"Upload failed"**
   - Kiểm tra định dạng file được hỗ trợ
   - Đảm bảo file không quá lớn (< 10MB)

3. **"Search not working"**
   - Kiểm tra TAVILY_API_KEY
   - Kiểm tra kết nối internet

### Debug mode
Mở Developer Console để xem logs chi tiết về:
- API calls
- Embedding generation
- Search results
- Error messages

## Tối ưu hóa

### Performance
- Embeddings được cache trong SQLite
- Chunking size tối ưu (1000 chars, overlap 200)
- Cosine similarity search hiệu quả

### Accuracy
- Semantic search với threshold 0.7
- Fallback mechanism đa tầng
- Context-aware response generation

## Phát triển thêm

### Tính năng có thể thêm
- [ ] Support thêm file formats (Excel, PowerPoint)
- [ ] Multi-language support
- [ ] Conversation memory
- [ ] Advanced search filters
- [ ] Export chat history
- [ ] Voice input
- [ ] Integration với external knowledge bases

### Cải thiện
- [ ] Caching layer cho embeddings
- [ ] Batch processing cho multiple files
- [ ] Real-time collaboration
- [ ] Analytics dashboard
