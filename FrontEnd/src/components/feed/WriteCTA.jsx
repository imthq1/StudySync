import { Button } from "../ui";

import "../../styles/components/feed/WriteCTA.scss";

export default function WriteCTA() {
  return (
    <div className="write-cta">
      <div>
        <p className="write-cta__title">Chia sẻ kiến thức của bạn</p>
        <p className="write-cta__subtitle">
          Viết bài, đặt câu hỏi hoặc upload tài liệu
        </p>
      </div>

      <div className="write-cta__actions">
        <Button variant="primary" size="sm">+ Tạo bài</Button>
        <Button variant="ghost" size="sm">📎 Upload</Button>
      </div>
    </div>
  );
}
