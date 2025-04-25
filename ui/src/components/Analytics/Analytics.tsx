"use client"; // if you're fetching client-side or using state/hooks here

import { useState, useEffect } from "react";

export default function Analytics() {
  interface AnalyticsData {
    followers: number;
    impressions: number;
    engagementRate: number;
    topPosts: { id: number; title: string; likes: number }[];
  }

  const [data, setData] = useState<AnalyticsData | null>(null);

  // Example: Fetch data from Meta API (or mock for now)
  useEffect(() => {
    const fetchData = async () => {
      // Mock data or real API fetch here
      const mockData = {
        followers: 12345,
        impressions: 78910,
        engagementRate: 4.56,
        topPosts: [
          { id: 1, title: "Post 1", likes: 5678 },
          { id: 2, title: "Post 2", likes: 4321 },
          { id: 3, title: "Post 3", likes: 3210 },
        ],
      };
      setData(mockData);
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Instagram Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Followers</h2>
          <p className="text-2xl font-bold">{data.followers}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Post Impressions</h2>
          <p className="text-2xl font-bold">{data.impressions}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Engagement Rate</h2>
          <p className="text-2xl font-bold">{data.engagementRate}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Top Performing Posts</h2>
        <ul className="space-y-2">
          {data.topPosts.map((post: { id: number; title: string; likes: number }) => (
            <li key={post.id}>📸 {post.title} – {post.likes} likes</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
