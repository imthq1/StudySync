import { useState } from "react";
import { Avatar, Badge } from "../ui";
import { POST_TYPE_META } from "../../constants/mockData";

import "../../styles/components/feed/PostCard.scss";

export default function PostCard({ post, index = 0 }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likes);
  const meta = POST_TYPE_META[post.type];

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div
      className="post-card"
      style={{
        "--post-color": post.color,
        "--post-soft": post.soft,
        animationDelay: `${index * 0.07}s`,
      }}
    >
      <div className="post-card__body">
        <Avatar initials={post.avatar} color={post.color} />

        <div className="post-card__content">
          <div className="post-card__meta-row">
            <span className="post-card__type-badge">
              {meta.icon} {meta.label}
            </span>
            <Badge label={post.tag} color={post.color} />
          </div>

          <p className="post-card__title">{post.title}</p>

          <div className="post-card__footer">
            <span className="post-card__author">
              {post.author} · {post.time}
            </span>
            <div className="post-card__actions">
              <button
                type="button"
                onClick={handleLike}
                className={`post-card__like-btn${liked ? " post-card__like-btn--liked" : ""}`}
              >
                ♥ {count}
              </button>
              <span className="post-card__comments">💬 {post.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
