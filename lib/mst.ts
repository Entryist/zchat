import { Instance, onSnapshot, types } from 'mobx-state-tree'
import storage from 'localforage'
import { mst } from 'reactotron-mst'
import * as actions from './mst-actions'

const Tron =
  typeof window !== 'undefined' ? require('reactotron-react-js').default : { configure: () => {} }
// import Tron from 'reactotron-react-js'

export const EventModel = types.model('Event').props({
  id: types.identifier,
  createdAt: types.Date,
  content: types.string,
  sig: types.string,
  kind: types.number,
  pubkey: types.string,
})

export interface Event extends Instance<typeof EventModel> {}

export const ROOT_STATE_STORAGE_KEY = 'root8'

export const RootStoreModel = types
  .model({
    publicKey: '',
    privateKey: '',
    city: types.maybeNull(types.string),
    coords: types.frozen(),
    countryCode: types.maybeNull(types.string),
    showFeed: false,
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

    seeNearby: async (): Promise<void> => await actions.seeNearby(self as RootStore),
    setCity(city: string) {
      self.city = city
    },
    setCoords(coords: any) {
      self.coords = coords
    },
    setCountryCode(code: string) {
      self.countryCode = code
    },
    setShowFeed(show: boolean) {
      self.showFeed = show
    },
    // setUser(user: TwitterMetadata) {
    //   self.user = user
    // },
    reset() {
      // self.user = null
      // self.city = null
      // self.coords = null
      // self.countryCode = null
      // self.posts = undefined
    },
  }))
  .views((self) => ({
    get postsArray(): any[] {
      const posts = Array.from(self.events.values()).sort((p1, p2) =>
        p1.createdAt > p2.createdAt ? -1 : 1
      )
      console.log(posts)
      return posts
      // const posts = Array.from(self.posts.values())
      // return posts
      //   .filter((p) => !!p.twitterMetadata)
      //
    },
  }))

// export interface Post extends Instance<typeof PostModel> {}
// export interface TwitterMetadata extends Instance<typeof TwitterMetadataModel> {}
export interface RootStore extends Instance<typeof RootStoreModel> {}

export async function setupRootStore() {
  let rootStore: RootStore
  let data: any
  // prepare the environment that will be associated with the RootStore.
  // const env = await createEnvironment()
  rootStore = RootStoreModel.create({}) // , env
  try {
    // load data from storage
    data = (await storage.getItem(ROOT_STATE_STORAGE_KEY)) || {}
    rootStore = RootStoreModel.create(JSON.parse(data)) // , env
  } catch (e) {
    // if there's any problems loading, then let's at least fallback to an empty state
    // instead of crashing.
    rootStore = RootStoreModel.create({}) // , env

    // but please inform us what happened
    console.log(e)
    // __DEV__ && console.tron.error(e.message, null)
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
  // reactotron logging
  // if (__DEV__) {
  // env.reactotron.setRootStore(rootStore, data)
  // }

  let lastSaved = new Date()
  let secondsSinceLastSent: number | null = null
  let SAVE_INTERVAL = 5

  // track changes & save to storage
  onSnapshot(rootStore, (snapshot) => {
    storage.setItem(ROOT_STATE_STORAGE_KEY, JSON.stringify(snapshot))
    // const now = new Date()
    // const dif = now.getTime() - lastSaved.getTime()
    // secondsSinceLastSent = dif / 1000

    // if (!lastSaved || secondsSinceLastSent > SAVE_INTERVAL) {
    //   lastSaved = new Date()
    //   storage.setItem(ROOT_STATE_STORAGE_KEY, JSON.stringify(snapshot))
    //   console.log('Saved', lastSaved)
    // }
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
