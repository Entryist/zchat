import { Event, EventModel, normalizeEvent, RootStore } from '@lib/mst'
import { pool } from '@lib/nostr'

export const subscribeToUser = async (self: RootStore, pubkey: string) => {
  // console.log({
  //   name: 'subscribeToUser',
  //   preview: `Subscribing to ${pubkey}`,
  // })

  const onEvent = (event: any, relay: any) => {
    console.log(`Received event ${event.id ?? ''}`, event, relay)
    const eventToSave: Event = normalizeEvent(event)
    self.setEvent(eventToSave)
  }

  pool.sub({
    cb: onEvent,
    filter: {
      author: pubkey,
    },
  })

  return true
}
