export interface WisdomArticle {
  id: string;
  weekNumber: number;
  category: string;
  title: string;
  author: string;
  readingTime: number;
  imageUrl: string;
  excerpt: string;
}

export const wisdomArticles: WisdomArticle[] = [
  {
    id: "harmony",
    weekNumber: 1,
    category: "WEEKLY REFLECTION",
    title: "The Silent Language of Shared Presence",
    author: "Dr. A. Reed",
    readingTime: 5,
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&auto=format&fit=crop",
    excerpt: "Presence is not about proximity. It is about attention.",
  },
  {
    id: "opinions",
    weekNumber: 2,
    category: "COMMUNICATION",
    title: "Finding Harmony in Differing Opinions",
    author: "M. Thomas",
    readingTime: 4,
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=400&auto=format&fit=crop",
    excerpt: "Two people can hold different truths and both be right.",
  },
  {
    id: "me-in-we",
    weekNumber: 3,
    category: "IDENTITY",
    title: 'The Importance of Maintaining "Me" in "We"',
    author: "S. Kim",
    readingTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&auto=format&fit=crop",
    excerpt: "A healthy relationship needs two whole people.",
  },
  {
    id: "micro",
    weekNumber: 4,
    category: "CONNECTION",
    title: "The Science of Micro-Moments of Connection",
    author: "Dr. A. Reed",
    readingTime: 3,
    imageUrl: "https://images.unsplash.com/photo-1472691753843-eac1d2d79867?w=400&auto=format&fit=crop",
    excerpt: "A 3-second look can shift the emotional temperature of an entire day.",
  },
];
