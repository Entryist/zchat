import { Instance, onSnapshot, types } from 'mobx-state-tree'
import storage from 'localforage'
import { mst } from 'reactotron-mst'
import * as actions from './mst-actions'

const Tron =
  typeof window !== 'undefined' ? require('reactotron-react-js').default : { configure: () => {} }

export const EventModel = types.model('Event').props({
  id: types.identifier,
  createdAt: types.Date,
  content: types.string,
  sig: types.string,
  kind: types.number,
  pubkey: types.string,
})

export interface Event extends Instance<typeof EventModel> {}

export const ROOT_STATE_STORAGE_KEY = 'root11'

export const RootStoreModel = types
  .model({
    publicKey: '',
    privateKey: '',
    events: types.map(EventModel),
  })
  .actions((self) => ({
    createPost: async (text: string): Promise<void> =>
      await actions.createPost(self as RootStore, text),
    subscribeToUser: async (pubkey: string): Promise<any> =>
      await actions.subscribeToUser(self as RootStore, pubkey),
    login: async (): Promise<void> => await actions.login(self as RootStore),
    setPublicKey(key: string) {
      self.publicKey = key
    },
    setPrivateKey(key: string) {
      self.privateKey = key
    },
    setEvent(event: Event) {
      self.events?.put(event)
    },
  }))
  .views((self) => ({
    get postsArray(): any[] {
      const posts = Array.from(self.events.values()).sort((p1, p2) =>
        p1.createdAt > p2.createdAt ? -1 : 1
      )
      return posts
    },
  }))

export interface RootStore extends Instance<typeof RootStoreModel> {}

export async function setupRootStore() {
  let rootStore: RootStore
  let data: any
  rootStore = RootStoreModel.create({})
  try {
    // load data from storage
    data = (await storage.getItem(ROOT_STATE_STORAGE_KEY)) || {}
    rootStore = RootStoreModel.create(JSON.parse(data)) // , env
  } catch (e) {
    // if there's any problems loading, then let's at least fallback to an empty state
    // instead of crashing.
    rootStore = RootStoreModel.create({})
    console.log(e)
  }

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    Tron.configure({
      name: 'Z Chat',
      port: 9090,
    })

    // ignore some chatty `mobx-state-tree` actions
    const RX = /postProcessSnapshot|@APPLY_SNAPSHOT/

    // hookup mobx-state-tree middleware
    Tron.use(
      mst({
        filter: (event) => RX.test(event.name) === false,
      })
    )
    Tron.connect()
    Tron.trackMstNode(rootStore)
  }

  // track changes & save to storage
  onSnapshot(rootStore, (snapshot) => {
    storage.setItem(ROOT_STATE_STORAGE_KEY, JSON.stringify(snapshot))
  })

  return rootStore
}

export const normalizeEvent = (event: any) => {
  const normalized: Event = EventModel.create({
    id: event.id,
    createdAt: event.created_at,
    content: event.content,
    sig: event.sig,
    kind: event.kind,
    pubkey: event.pubkey,
  })
  return normalized
}
