import { AiFillAliwangwang } from 'react-icons/ai'
import { FaFacebook, FaInstagram } from 'react-icons/fa'

export default function Landing() {
  const handleFacebookLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook-login`
    // window.location.href = '/api/auth/facebook-login'
  }

  const handleInstagramLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/instagram-login`
    // window.location.href = '/api/auth/instagram-login'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <AiFillAliwangwang className="size-8" />
          <h1 className="text-xl font-bold">Viralytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Login with</span>
          <button
            onClick={handleInstagramLogin}
            className="font-semibold cursor-pointer"
          >
            <FaInstagram />
          </button>
          <span className="font-semibold">or</span>
          <button
            onClick={handleFacebookLogin}
            className="font-semibold cursor-pointer"
          >
            <FaFacebook />
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
              type="button"
              className="dark:bg-white text-white font-semibold bg-black dark:text-black px-4 py-2 rounded cursor-pointer flex flex-row items-center justify-center gap-2"
              onClick={handleFacebookLogin}
            >
              <FaFacebook />
              Log in with Facebook
            </button>
            <button
              type="button"
              className="my-3 dark:bg-white text-white font-semibold bg-black dark:text-black px-4 py-2 rounded cursor-pointer flex flex-row items-center justify-center gap-2"
              onClick={handleInstagramLogin}
            >
              <FaInstagram />
              Log in with Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
