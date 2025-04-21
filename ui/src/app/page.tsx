"use client";

import { useRouter } from "next/navigation";
import { login } from "@viralytics/utils/auth";
import { AiFillAliwangwang } from "react-icons/ai";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    if (login()) {
      router.push("/dashboard");
    } else {
      alert("nah, try again");
    }
  };

  return (
    <div className="flex flex-row items-center justify-center h-screen px-8">
      <AiFillAliwangwang className="size-32 me-10 animate-bounce" />
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <span className="mb-4">Use your Instagram account to continue</span>
          <button className="dark:bg-white text-white font-semibold bg-black dark:text-black px-4 py-2 rounded" onClick={handleLogin}>
            Log in with Instagram
          </button>
        </div>
      </div>
    </div>
  );
}
