import { Buffer } from 'buffer'
import * as secp256k1 from '@noble/secp256k1'

export const sha256 = (m) => secp256k1.utils.sha256(Uint8Array.from(m))

export function serializeEvent(evt) {
  return JSON.stringify([0, evt.pubkey, evt.created_at, evt.kind, evt.tags || [], evt.content])
}

export async function getEventHash(event) {
  let eventHash = await sha256(Buffer.from(serializeEvent(event)))
  return Buffer.from(eventHash).toString('hex')
}

export function normalizeRelayURL(url) {
  let [host, ...qs] = url.split('?')
  if (host.slice(0, 4) === 'http') host = 'ws' + host.slice(4)
  if (host.slice(0, 2) !== 'ws') host = 'wss://' + host
  if (host.length && host[host.length - 1] === '/') host = host.slice(0, -1)
  return [host, ...qs].join('?')
}

export function relayConnect(url, onNotice) {
  url = normalizeRelayURL(url)

  var ws, resolveOpen, untilOpen
  var openSubs = {}
  let attemptNumber = 1
  let nextAttemptSeconds = 1

  function resetOpenState() {
    untilOpen = new Promise((resolve) => {
      resolveOpen = resolve
    })
  }

  var channels = {}

  function connect() {
    ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('connected to', url)
      resolveOpen()

      // restablish old subscriptions
      for (let channel in openSubs) {
        let filters = openSubs[channel]
        let cb = channels[channel]
        sub({ cb, filter: filters }, channel)
      }
    }
    ws.onerror = () => {
      console.log('error connecting to relay', url)
    }
    ws.onclose = () => {
      resetOpenState()
      attemptNumber++
      nextAttemptSeconds += attemptNumber
      console.log(`relay ${url} connection closed. reconnecting in ${nextAttemptSeconds} seconds.`)
      setTimeout(async () => {
        try {
          connect()
        } catch (err) {}
      }, nextAttemptSeconds * 1000)
    }

    ws.onmessage = async (e) => {
      var data
      try {
        data = JSON.parse(e.data)
      } catch (err) {
        data = e.data
      }

      if (data.length > 1) {
        if (data[0] === 'NOTICE') {
          if (data.length < 2) return

          console.log('message from relay ' + url + ': ' + data[1])
          onNotice(data[1])
          return
        }

        if (data[0] === 'EVENT') {
          if (data.length < 3) return

          let channel = data[1]
          let event = data[2]

          if (await verifySignature(event)) {
            if (channels[channel]) {
              channels[channel](event)
            }
          } else {
            console.warn('got event with invalid signature from ' + url, event)
          }
          return
        }
      }
    }
  }

  resetOpenState()

  try {
    connect()
  } catch (err) {}

  async function trySend(params) {
    let msg = JSON.stringify(params)

    await untilOpen
    ws.send(msg)
  }

  const sub = ({ cb, filter }, channel = Math.random().toString().slice(2)) => {
    var filters = []
    if (Array.isArray(filter)) {
      filters = filter
    } else {
      filters.push(filter)
    }

    trySend(['REQ', channel, ...filters])
    channels[channel] = cb
    openSubs[channel] = filters

    const activeCallback = cb
    const activeFilters = filters

    return {
      sub: ({ cb = activeCallback, filter = activeFilters }) => sub({ cb, filter }, channel),
      unsub: () => {
        delete openSubs[channel]
        delete channels[channel]
        trySend(['CLOSE', channel])
      },
    }
  }

  return {
    url,
    sub,
    async publish(event, statusCallback = (status) => {}) {
      try {
        await trySend(['EVENT', event])
        statusCallback(0)
        let { unsub } = relay.sub({
          cb: () => {
            statusCallback(1)
          },
          filter: { id: event.id },
        })
        setTimeout(unsub, 5000)
      } catch (err) {
        statusCallback(-1)
      }
    },
    close() {
      ws.close()
    },
    get status() {
      return ws.readyState
    },
  }
}

export function relayPool(globalPrivateKey) {
  const relays = {}
  const globalSub = []
  const noticeCallbacks = []

  function propagateNotice(notice, relayURL) {
    for (let i = 0; i < noticeCallbacks.length; i++) {
      let { relay } = relays[relayURL]
      noticeCallbacks[i](notice, relay)
    }
  }

  const activeSubscriptions = {}

  const sub = ({ cb, filter }, id = Math.random().toString().slice(2)) => {
    const subControllers = Object.fromEntries(
      Object.values(relays)
        .filter(({ policy }) => policy.read)
        .map(({ relay }) => [
          relay.url,
          relay.sub({ filter, cb: (event) => cb(event, relay.url) }, id),
        ])
    )

    const activeCallback = cb
    const activeFilters = filter

    activeSubscriptions[id] = {
      sub: ({ cb = activeCallback, filter = activeFilters }) => {
        Object.entries(subControllers).map(([relayURL, sub]: any) => [
          relayURL,
          sub.sub({ cb, filter }, id),
        ])
        return activeSubscriptions[id]
      },
      addRelay: (relay) => {
        subControllers[relay.url] = relay.sub({ cb, filter }, id)
        return activeSubscriptions[id]
      },
      removeRelay: (relayURL) => {
        if (relayURL in subControllers) {
          subControllers[relayURL].unsub()
          if (Object.keys(subControllers).length === 0) sub.unsub()
        }
        return activeSubscriptions[id]
      },
      unsub: () => {
        Object.values(subControllers).forEach((sub) => sub.unsub())
        delete activeSubscriptions[id]
      },
    }

    return activeSubscriptions[id]
  }

  return {
    sub,
    relays,
    setPrivateKey(privateKey) {
      globalPrivateKey = privateKey
    },
    async addRelay(url, policy = { read: true, write: true }) {
      let relayURL = normalizeRelayURL(url)
      if (relayURL in relays) return

      let relay = await relayConnect(url, (notice) => {
        propagateNotice(notice, relayURL)
      })
      relays[relayURL] = { relay, policy }

      Object.values(activeSubscriptions).forEach((subscription) => subscription.addRelay(relay))

      return relay
    },
    removeRelay(url) {
      let relayURL = normalizeRelayURL(url)
      let { relay } = relays[relayURL]
      if (!relay) return
      Object.values(activeSubscriptions).forEach((subscription) => subscription.removeRelay(relay))
      relay.close()
      delete relays[relayURL]
    },
    onNotice(cb) {
      noticeCallbacks.push(cb)
    },
    offNotice(cb) {
      let index = noticeCallbacks.indexOf(cb)
      if (index !== -1) noticeCallbacks.splice(index, 1)
    },
    async publish(event, statusCallback = (status, relayURL) => {}) {
      if (!event.sig) {
        event.tags = event.tags || []

        if (globalPrivateKey) {
          event.id = await getEventHash(event)
          event.sig = await signEvent(event, globalPrivateKey)
        } else {
          throw new Error(
            "can't publish unsigned event. either sign this event beforehand or pass a private key while initializing this relay pool so it can be signed automatically."
          )
        }
      }

      Object.values(relays)
        .filter(({ policy }) => policy.write)
        .map(async ({ relay }) => {
          try {
            await relay.publish(event, (status) => statusCallback(status, relay.url))
          } catch (err) {
            statusCallback(-1, relay.url)
          }
        })

      return event
    },
  }
}

export function matchFilter(filter, event) {
  if (filter.id && event.id !== filter.id) return false
  if (filter.kind && event.kind !== filter.kind) return false
  if (filter.author && event.pubkey !== filter.author) return false
  if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) return false
  if (filter['#e'] && !event.tags.find(([t, v]) => t === 'e' && v === filter['#e'])) return false
  if (filter['#p'] && !event.tags.find(([t, v]) => t === 'p' && v === filter['#p'])) return false
  if (filter.since && event.created_at <= filter.since) return false

  return true
}

export function matchFilters(filters, event) {
  for (let i = 0; i < filters.length; i++) {
    if (matchFilter(filters[i], event)) return true
  }
  return false
}

export const pool = relayPool(null)

// EVENT

export async function verifySignature(event) {
  return await secp256k1.schnorr.verify(event.sig, await getEventHash(event), event.pubkey)
}

export async function signEvent(event, key) {
  let eventHash = await getEventHash(event)
  return await secp256k1.schnorr.sign(eventHash, key)
}
