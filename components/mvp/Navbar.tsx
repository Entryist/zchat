import { Disclosure } from '@headlessui/react'
import { MenuIcon, XIcon, LogoutIcon } from '@heroicons/react/outline'
import { useStores } from '@lib/root-store-context'
import storage from 'localforage'
import { ROOT_STATE_STORAGE_KEY } from '@lib/mst'
import { observer } from 'mobx-react-lite'

function Navbar() {
  const setPublicKey = useStores().setPublicKey
  const setPrivateKey = useStores().setPrivateKey
  const authed = !!useStores().publicKey
  const handleLogout = async () => {
    setPublicKey('')
    setPrivateKey('')
    storage.removeItem(ROOT_STATE_STORAGE_KEY)
    console.log('Logged out')
  }
  return (
    <Disclosure as='nav' className='bg-transparent' style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      {({ open }) => (
        <>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16'>
              <div className='flex'>
                <div className='-ml-2 mr-2 flex items-center md:hidden'>
                  {/* Mobile menu button */}
                  <Disclosure.Button className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
                    <span className='sr-only'>Open main menu</span>
                    {open ? (
                      <XIcon className='block h-6 w-6' aria-hidden='true' />
                    ) : (
                      <MenuIcon className='block h-6 w-6' aria-hidden='true' />
                    )}
                  </Disclosure.Button>
                </div>
                <div className='flex-shrink-0 flex items-center py-3'></div>
              </div>
              <div className='flex items-center'>
                <div className='hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center'>
                  {authed && (
                    <button
                      type='button'
                      className='bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
                      onClick={handleLogout}
                    >
                      <span className='sr-only'>TEMP LOGOUT</span>
                      <LogoutIcon className='h-6 w-6' aria-hidden='true' />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'></div>
            <div className='pt-4 pb-3 border-t border-gray-700'>
              <div className='flex items-center px-5 sm:px-6'>
                <button
                  type='button'
                  className='ml-auto flex-shrink-0 bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white'
                  onClick={handleLogout}
                >
                  <span className='sr-only'>View notifications</span>
                  <LogoutIcon className='h-6 w-6' aria-hidden='true' />
                </button>
              </div>
              <div className='mt-3 px-2 space-y-1 sm:px-3'></div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default observer(Navbar)
