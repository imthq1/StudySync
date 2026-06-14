/**
 * postService — service layer cho API bài viết
 * Hiện tại dùng mock data; thay BASE_URL và bỏ comment
 * khi backend sẵn sàng.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Lấy danh sách bài viết (có filter)
 * @param {{ type?: string, tag?: string, q?: string }} params
 * @returns {Promise<Array>}
 */
export async function getPosts(params = {}) {
  // const query = new URLSearchParams(params).toString();
  // const res = await fetch(`${BASE_URL}/api/posts?${query}`);
  // if (!res.ok) throw new Error("Failed to fetch posts");
  // return res.json();

  // --- mock fallback ---
  const { POSTS } = await import("../constants/mockData");
  return POSTS;
}

/**
 * Like / unlike bài viết
 * @param {string} postId
 * @returns {Promise<{ liked: boolean, count: number }>}
 */
export async function toggleLike(postId) {
  // const res = await fetch(`${BASE_URL}/api/posts/${postId}/like`, { method: "POST" });
  // return res.json();
  return { liked: true, count: 1 }; // mock
}
