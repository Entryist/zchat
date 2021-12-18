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
