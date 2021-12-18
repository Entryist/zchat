// import dynamic from 'next/dynamic'

const tools = process.browser ? require('nostr-tools') : null

// const tools = dynamic(import('nostr-tools'), { ssr: false })

// console.log(tools)

// import { relayPool } from 'nostr-tools'
const relayPool = tools ? tools.relayPool : () => {}

export const pool = relayPool()
//tools.relayPool()
