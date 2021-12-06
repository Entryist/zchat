import PostFeed from '@components/PostFeed'
import Metatags from '@components/Metatags'
import Loader from '@components/Loader'
import { auth, firestore, fromMillis, postToJSON, twitterAuthProvider } from '@lib/firebase'
import { useCallback, useEffect, useState } from 'react'
import { magic } from '@lib/magic'
import { useRouter } from 'next/router'

export default function LoginHero() {
  const router = useRouter()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const signInWithTwitter = useCallback(async (provider) => {
    setIsLoggingIn(true)

    try {
      console.log('attempting')
      await magic.oauth.loginWithRedirect({
        provider,
        redirectURI: new URL('/callback', window.location.origin).href,
      })
      console.log('did what')
      // history.push("/");
    } catch (e) {
      console.log('failed:', e)
      setIsLoggingIn(false)
    }
  }, [])
  return (
    <div
      className='flex flex-col h-screen w-screen justify-center items-center'
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <main className='mx-auto max-w-7xl px-4'>
        <div className='text-center'>
          <h1 className='text-4xl tracking-tight font-extrabold text-gray-100 sm:text-5xl md:text-6xl'>
            <span className='block xl:inline'>Connect Freely.</span>
          </h1>
          <p className='mt-3 max-w-md mx-auto text-base text-indigo-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
            Peer-to-Peer Rides and More
          </p>
          <div className='mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8'>
            <div className='rounded-md shadow'>
              <a
                href='#'
                className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10'
                onClick={() => signInWithTwitter('twitter')}
              >
                Log in with Twitter
              </a>
            </div>
            <div className='mt-3 rounded-md shadow sm:mt-0 sm:ml-3'>
              <a
                href='#'
                className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10'
                onClick={() => router.push('feed')}
              >
                Skip login
              </a>
            </div>
            {/* <div className='rounded-md shadow'>
        <a
          href='#'
          className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10'
        >
          Get started
        </a>
      </div>
      <div className='mt-3 rounded-md shadow sm:mt-0 sm:ml-3'>
        <a
          href='#'
          className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10'
        >
          Live demo
        </a>
      </div> */}
          </div>
        </div>
      </main>
    </div>
  )
}