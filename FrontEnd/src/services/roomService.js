/**
 * roomService — service layer cho API study rooms
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Lấy danh sách phòng đang hoạt động
 * @returns {Promise<Array>}
 */
export async function getRooms() {
  // const res = await fetch(`${BASE_URL}/api/rooms`);
  // return res.json();

  const { ROOMS } = await import("../constants/mockData");
  return ROOMS;
}

/**
 * Tham gia phòng học
 * @param {string} roomId
 * @returns {Promise<{ success: boolean }>}
 */
export async function joinRoom(roomId) {
  // const res = await fetch(`${BASE_URL}/api/rooms/${roomId}/join`, { method: "POST" });
  // return res.json();
  return { success: true };
}
