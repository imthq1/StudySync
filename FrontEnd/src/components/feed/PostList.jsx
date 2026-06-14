import PostCard from "./PostCard";

import "../../styles/components/feed/PostList.scss";

export default function PostList({ posts }) {
  if (posts.length === 0) {
    return (
      <div className="post-list__empty">
        Không tìm thấy nội dung phù hợp 🙁
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}
    </div>
  );
}
