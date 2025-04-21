import { AiFillAliwangwang } from "react-icons/ai";

// components/Sidebar.tsx
export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="flex flex-row gap-2 items-center justify-left my-4 mx-2">
        <AiFillAliwangwang className="size-10" />
        <h2 className="font-bold text-xl">Viralytics</h2>
      </div>
      <hr className="my-4 mx-2 border-gray-300"/>
      <ul className="font-semibold mx-2 flex gap-2 flex-col">
        <li>Dashboard</li>
        <li>Settings</li>
        <li>Analytics</li>
        <li>Predictive Tools</li>
        <li>Schedule</li>
      </ul>
    </div>
  );
}
