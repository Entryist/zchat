import { useEffect, useState } from 'react'
import Feed from '@components/mvp/Feed'
import LoginHero from '@components/mvp/LoginHero'
import { auth, functions, queryFirestore } from '@lib/firebase'
import { useStore } from '@lib/store'
import { useStores } from '@lib/root-store-context'
import { observer } from 'mobx-react-lite'

const authRoute = process.env.NODE_ENV === 'production' ? 'auth' : 'authDev'

function HomePage() {
  const [authed, setAuthed] = useState(false)
  const store = useStores()
  const lat = useStores().coords?.lat
  const lng = useStores().coords?.lng
  const showFeed = useStores().showFeed
  const publicKey = useStores().publicKey

  // still need to handle no posts
  return !!publicKey ? <Feed /> : <LoginHero />
}

export default observer(HomePage)
