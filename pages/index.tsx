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
  const subscribeToUser = useStores().subscribeToUser

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

    subscribeToUser('645981d1d595fb60bbfd6539a82a8808f2a17e95c94694196d7ba81a587d659a')
    subscribeToUser('e5b6b45fbe40c891de636679cf71c00d26f95a9c9a093c78adf760ef265d42f5')
    // subscribeToUser('778940b4cdf10088f95427e25f6d913a1467b0921d2bd23479d8ff5e4107a345')
    // subscribeToUser('6d07ec2d8c4920e0aa561748febd155900242d487c02deb09380087123b287ee')

    // subscribe to self
    subscribeToUser(publicKey)
  }, [privkey])

  return !!publicKey ? <Feed /> : <LoginHero />
}

export default observer(HomePage)
