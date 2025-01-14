import crypto from 'crypto'
import * as secp from 'noble-secp256k1'

export function encrypt(privkey, pubkey, text) {
  const key = secp.getSharedSecret(privkey, '02' + pubkey)
  const normalizedKey = getOnlyXFromFullSharedSecret(key)

  let iv = crypto.randomFillSync(new Uint8Array(16))
  var cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(normalizedKey, 'hex'), iv)
  let encryptedMessage = cipher.update(text, 'utf8', 'base64')
  encryptedMessage += cipher.final('base64')

  return [encryptedMessage, Buffer.from(iv.buffer).toString('base64')]
}

function getOnlyXFromFullSharedSecret(fullSharedSecretCoordinates) {
  return fullSharedSecretCoordinates.substr(2, 64)
}
