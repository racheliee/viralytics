import { AiFillAliwangwang } from 'react-icons/ai'

export default function Landing() {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/meta-login`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <AiFillAliwangwang className="size-8" />
          <h1 className="text-xl font-bold">Viralytics</h1>
        </div>
        <div>
          <button
            onClick={handleLogin}
            className="font-semibold cursor-pointer "
          >
            Login
          </button>
        </div>
      </header>
      <div className="flex flex-row items-center justify-center h-screen px-8">
        <AiFillAliwangwang className="size-32 me-10 animate-bounce" />
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold">Viralytics</h1>
            <span className="mb-2">Where data meets virality</span>
            <button
              className="dark:bg-white text-white font-semibold bg-black dark:text-black px-4 py-2 rounded cursor-pointer"
              onClick={handleLogin}
            >
              Log in with Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
