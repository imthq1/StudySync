import { useState, useMemo } from "react";
import { POSTS } from "../constants/mockData";

/**
 * useFeed — quản lý toàn bộ state lọc / tìm kiếm cho feed bài viết
 *
 * @returns {object} {
 *   filteredPosts  - danh sách bài sau khi lọc
 *   activeTab      - index tab đang chọn (0-3)
 *   activeTag      - tag đang filter (null = tắt)
 *   query          - chuỗi tìm kiếm
 *   setActiveTab
 *   setActiveTag
 *   setQuery
 * }
 */
export function useFeed() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeTag, setActiveTag] = useState(null);
  const [query, setQuery]         = useState("");

  const TAB_TYPE_MAP = {
    1: "article",
    2: "question",
    3: "document",
  };

  const filteredPosts = useMemo(() => {
    return POSTS.filter((post) => {
      const tabMatch  = activeTab === 0 || post.type === TAB_TYPE_MAP[activeTab];
      const tagMatch  = !activeTag || post.tag === activeTag;
      const queryMatch = !query || post.title.toLowerCase().includes(query.toLowerCase());
      return tabMatch && tagMatch && queryMatch;
    });
  }, [activeTab, activeTag, query]);

  return {
    filteredPosts,
    activeTab,
    activeTag,
    query,
    setActiveTab,
    setActiveTag,
    setQuery,
  };
}
