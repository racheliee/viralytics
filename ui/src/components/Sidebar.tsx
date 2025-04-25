"use client";

import { AiFillAliwangwang } from "react-icons/ai";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Analytics", href: "/analytics" },
    { name: "Engagement", href: "/engagement" },
    { name: "Predictive Tools", href: "/predictive-tools" },
    { name: "Schedule", href: "/schedule" },
    { name: "Followers", href: "/followers" },
    { name: "Trends", href: "/trends" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <div className="flex flex-row gap-2 items-center justify-left my-4 mx-2">
        <AiFillAliwangwang className="size-10" />
        <h2 className="font-bold text-xl">Viralytics</h2>
      </div>
      <hr className="my-4 mx-2 border-gray-300" />
      <ul className="font-semibold mx-2 flex gap-2 flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`hover:text-blue-500 dark:hover:text-blue-400 ${
                  isActive ? "text-blue-600 font-bold dark:text-blue-500" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
