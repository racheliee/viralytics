"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiFillAliwangwang } from "react-icons/ai";

export function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  if (!mounted) { // prevent ssr mismatch (hydration error)
    return null;
  }

  return (
    <div className="h-screen mx-auto grid place-items-center text-center px-8">
      <div className="flex-col flex items-center">
        <AiFillAliwangwang className="w-20 h-20 mx-auto animate-spin" />
        <span color="blue-gray" className="mt-5 text-3xl font-bold md:text-4xl">
          Error 404
        </span>
        <span className="md:text-xl font-semibold">It looks like something went wrong.</span>
        <span className="mt-8 mb-14 text-md font-normal text-gray-400 mx-auto md:max-w-sm">Don&apos;t worry, our team is already on it. Please try refreshing the page or come back later. <br/>You will be redirected in {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}.</span>
        <button
          className="w-full px-4 font-semibold dark:bg-white bg-black max-w-50 min-h-10 rounded-lg text-white dark:text-black"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
