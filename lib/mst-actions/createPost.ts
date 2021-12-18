import { RootStore } from '@lib/mst'
import { encrypt } from '@lib/nip04'
import { pool } from '@lib/nostr'
import { getEventHash } from 'nostr-tools'

export const createPost = async (self: RootStore, text: string) => {
  if (text.length === 0) return

  const pubkey = self.publicKey
  const privkey = self.privateKey

  let [ciphertext, iv] = encrypt(self.privateKey, pubkey, text)

  // make event
  let event = {
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    kind: 1, // 4,
    tags: [['p', pubkey]],
    content: text,
    // content: ciphertext + '?iv=' + iv,
    id: '',
  }

  let lsKey = `messages.${pubkey}`
  // var messages = LocalStorage.getItem(lsKey) || []

  // if (messages.length > 0) {
  //   event.tags.push(['e', messages[messages.length - 1].id])
  // }
  event.id = await getEventHash(event)

  let message = {
    text,
    from: pubkey,
    id: event.id,
    created_at: event.created_at,
    tags: event.tags,
    loading: true,
    failed: false,
  }

  console.log(message)

  // messages.push(message)
  // LocalStorage.set(lsKey, messages)

  pool.publish(event)
  console.log('published?')
}
