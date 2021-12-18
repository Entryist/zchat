import { useEffect } from 'react'
import Feed from '@components/mvp/Feed'
import LoginHero from '@components/mvp/LoginHero'
import { useStores } from '@lib/root-store-context'
import { observer } from 'mobx-react-lite'
import { pool } from '@lib/nostr'

const relays = ['wss://freedom-relay.herokuapp.com/ws']

function HomePage() {
  const publicKey = useStores().publicKey
  const privkey = useStores().privateKey

  useEffect(() => {
    if (!privkey) return

    console.log('Priv key found. Connecting to relay')

    pool.setPrivateKey(privkey)

    relays.forEach((relay) => {
      pool.addRelay(relay)
    })

    pool.onNotice((notice, relay) => {
      console.log(`Relay ${relay.url} says: ${notice}`)
    })
  }, [privkey])

  return !!publicKey ? <Feed /> : <LoginHero />
}

export default observer(HomePage)
