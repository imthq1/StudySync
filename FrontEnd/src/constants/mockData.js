import { colors as C } from "./theme";

export const POSTS = [
  {
    id: 1,
    type: "article",
    title: "Hiểu sâu về Async/Await trong JavaScript",
    author: "Minh Tú",
    avatar: "MT",
    tag: "JavaScript",
    time: "2 giờ trước",
    likes: 48,
    comments: 12,
    color: C.accent,
    soft: C.accentSoft,
  },
  {
    id: 2,
    type: "question",
    title: "Tại sao useEffect chạy 2 lần trong React 18?",
    author: "Linh Đan",
    avatar: "LĐ",
    tag: "ReactJS",
    time: "4 giờ trước",
    likes: 31,
    comments: 9,
    color: C.pink,
    soft: C.pinkSoft,
  },
  {
    id: 3,
    type: "document",
    title: "[PDF] Giáo trình Data Structures & Algorithms",
    author: "Hoàng Nam",
    avatar: "HN",
    tag: "DSA",
    time: "hôm qua",
    likes: 124,
    comments: 34,
    color: C.green,
    soft: C.greenSoft,
  },
  {
    id: 4,
    type: "article",
    title: "Clean Architecture trong Node.js: Từ lý thuyết đến thực hành",
    author: "Phú Đại",
    avatar: "PĐ",
    tag: "Backend",
    time: "hôm qua",
    likes: 76,
    comments: 21,
    color: C.amber,
    soft: C.amberSoft,
  },
];

export const ROOMS = [
  {
    id: 1,
    name: "LeetCode Daily #88",
    members: 5,
    max: 8,
    topic: "Array & Hashing",
    color: C.accent,
    live: true,
  },
  {
    id: 2,
    name: "React Deep Dive",
    members: 3,
    max: 6,
    topic: "Hooks & Performance",
    color: C.pink,
    live: true,
  },
  {
    id: 3,
    name: "SQL Practice Zone",
    members: 7,
    max: 10,
    topic: "Window Functions",
    color: C.green,
    live: false,
  },
];

export const BUDDIES = [
  {
    id: 1,
    name: "An Nhiên",
    skills: ["React", "TypeScript"],
    goal: "Frontend Dev",
    avatar: "AN",
    online: true,
  },
  {
    id: 2,
    name: "Khoa Lê",
    skills: ["Python", "ML"],
    goal: "Data Science",
    avatar: "KL",
    online: true,
  },
  {
    id: 3,
    name: "Thảo Vy",
    skills: ["Java", "Spring"],
    goal: "Backend Dev",
    avatar: "TV",
    online: false,
  },
];

export const STATS = [
  { label: "Bài viết", value: "12.4K", icon: "📝" },
  { label: "Thành viên", value: "8.2K", icon: "🧑‍💻" },
  { label: "Câu hỏi đã giải", value: "31K", icon: "✅" },
  { label: "Study Rooms", value: "340", icon: "🏠" },
];

export const FEED_TABS = ["Tất cả", "Bài viết", "Câu hỏi", "Tài liệu"];

export const TRENDING_TAGS = [
  "JavaScript", "ReactJS", "Python", "Node.js",
  "DSA", "Docker", "SQL", "TypeScript", "Git", "CSS",
];

export const POST_TYPE_META = {
  article:  { icon: "✍️", label: "Bài viết" },
  question: { icon: "❓", label: "Câu hỏi" },
  document: { icon: "📄", label: "Tài liệu" },
};
