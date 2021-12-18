import '@styles/globals.css'
import 'tailwindcss/tailwind.css'
import Navbar from '@components/mvp/Navbar'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'
import Background from '@components/mvp/Background'
import { useEffect, useState } from 'react'
import { RootStore, setupRootStore } from '@lib/mst'
import { RootStoreProvider } from '@lib/root-store-context'
import Metatags from '@components/Metatags'

function MyApp({ Component, pageProps }) {
  const [rootStore, setRootStore] = useState<RootStore | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const root = await setupRootStore()
      setRootStore(root)
    })()
  }, [])

  return (
    <>
      <Head>
        <script src='https://unpkg.com/three/build/three.min.js' defer></script>
        <script src='https://unpkg.com/@here/harp.gl/dist/harp.js' defer></script>
        <script
          src='https://js.api.here.com/v3/3.1/mapsjs-core.js'
          type='text/javascript'
          defer
        ></script>
        <script
          src='https://js.api.here.com/v3/3.1/mapsjs-service.js'
          type='text/javascript'
          defer
        ></script>
      </Head>
      <Metatags />
      {!!rootStore && (
        <RootStoreProvider value={rootStore}>
          <Navbar />
          <Component {...pageProps} />
          <Toaster />
          <Background />
        </RootStoreProvider>
      )}
    </>
  )
}

export default MyApp
