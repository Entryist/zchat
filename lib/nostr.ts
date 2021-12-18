const tools = process.browser ? require('nostr-tools') : null
const relayPool = tools ? tools.relayPool : () => {}
export const pool = relayPool()
