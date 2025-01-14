import { useState } from 'react'
import { useStores } from '@lib/root-store-context'
import { observer } from 'mobx-react-lite'

function LoginHero() {
  const [buttonText, setButtonText] = useState('Create account')
  const login = useStores().login
  const publicKey = useStores().publicKey

  return (
    <div className='fixed flex flex-col h-screen w-screen justify-center items-center'>
      <main className='mx-auto max-w-7xl px-4'>
        <div
          className='-mt-12 px-16 text-center rounded-xl h-96 flex flex-col justify-center'
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <h1 className='text-4xl tracking-tight font-extrabold text-gray-100 sm:text-5xl md:text-6xl'>
            <span className='block xl:inline'>Speak Freely.</span>
          </h1>
          <p className='mt-3 max-w-md mx-auto text-base text-indigo-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
            Censorship resistant chat, Bitcoin style
          </p>
          <div className='mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8'>
            <div className='rounded-md shadow'>
              {!!publicKey ? (
                <p className='text-white'>{publicKey}</p>
              ) : (
                <button
                  className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10'
                  onClick={login}
                >
                  {buttonText}
                </button>
              )}
            </div>
          </div>

          <p className='text-gray-500 mt-6 underline'>
            <a href='https://github.com/entryist/zchat' target='_blank' rel='noreferrer'>
              See code on GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default observer(LoginHero)
