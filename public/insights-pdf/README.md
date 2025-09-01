# insights-pdf

Đặt file PDF cho mỗi bài viết Insight tại đây với tên trùng `slug` của bài:

- Đường dẫn: `public/insights-pdf/<slug>.pdf`
- Ví dụ: `public/insights-pdf/gpu-vs-cpu.pdf`

Trang `/insights/[slug]` sẽ tự động đọc file PDF này nếu bạn chưa cấu hình danh sách ảnh trong `src/data/insight-pages.ts`.

Lưu ý: Thư mục này chỉ chứa file tĩnh để client tải và render bằng pdf.js.
