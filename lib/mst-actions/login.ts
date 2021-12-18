import { RootStore } from '@lib/mst'
import randomBytes from 'randombytes'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import * as secp256k1 from '@noble/secp256k1'

export const login = async (self: RootStore) => {
  console.log('Attempting login.')
  // Generate new seed
  let randombytes = randomBytes(16)
  let mnemonic = bip39.entropyToMnemonic(randombytes.toString('hex'))
  let seed = bip39.mnemonicToSeedSync(mnemonic)
  let root = bip32.fromSeed(seed)

  const privatekey = root.privateKey.toString('hex')
  console.log('privatekey:', privatekey)
  const publickey = getPublicKey(privatekey)
  console.log('publickey:', publickey)
  self.setPublicKey(publickey)
  self.setPrivateKey(privatekey)
}

export const getPublicKey = (privateKey) => secp256k1.schnorr.getPublicKey(privateKey)
