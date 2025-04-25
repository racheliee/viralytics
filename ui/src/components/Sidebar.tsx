import Link from "next/link";
import { AiFillAliwangwang } from "react-icons/ai";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="flex flex-row gap-2 items-center justify-left my-4 mx-2">
        <AiFillAliwangwang className="size-10" />
        <h2 className="font-bold text-xl">Viralytics</h2>
      </div>
      <hr className="my-4 mx-2 border-gray-300" />
      <ul className="font-semibold mx-2 flex gap-2 flex-col">

        <li>
          <Link href="/analytics" className="hover:text-blue-500 dark:hover:text-blue-400">
            Analytics
          </Link>
        </li>
        <li>
          <Link href="/predictive-tools" className="hover:text-blue-500 dark:hover:text-blue-400">
            Predictive Tools
          </Link>
        </li>
        <li>
          <Link href="/engagement" className="hover:text-blue-500 dark:hover:text-blue-400">
            Engagement
          </Link>
        </li>
        <li>
          <Link href="/followers" className="hover:text-blue-500 dark:hover:text-blue-400">
            Followers
          </Link>
        </li>
        <li>
          <Link href="/schedule" className="hover:text-blue-500 dark:hover:text-blue-400">
            Schedule
          </Link>
        </li>
        <li>
          <Link href="/trends" className="hover:text-blue-500 dark:hover:text-blue-400">
            Trends
          </Link>
        </li>
        <li>
          <Link href="/settings" className="hover:text-blue-500 dark:hover:text-blue-400">
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}
