import PostBox from '@components/mvp/PostBox'
import FollowBox from '@components/mvp/FollowBox'
import { useStores } from '@lib/root-store-context'
import { useState } from 'react'
import Onboarding from './Onboarding'
import Post from './Post'
import { observer } from 'mobx-react-lite'
import { values } from 'mobx'

function Feed() {
  const [onboarded, setOnboarded] = useState(true)
  const posts = useStores().postsArray
  // console.log('posts:', posts)
  const city = useStores().city
  const publickey = useStores().publicKey
  // const events = useStores().events
  // const posts = events ? values(events) : []
  // console.log('posts:', posts)

  return (
    <>
      <div className='flex justify-center flex-col items-center'>
        <FollowBox />
        {onboarded ? <PostBox /> : <Onboarding />}

        <div
          className='flow-root p-8 m-8 rounded-xl w-full max-w-xl'
          style={{ backgroundColor: 'rgba(255,255,255,1)' }}
        >
          {posts.length === 0 && (
            <>
              <p className='mb-8'>Welcome {publickey}!</p>
              <p className='mb-8'>Make a post!</p>
            </>
          )}
          <ul role='list' className='-mb-8'>
            {posts.map((post, postIdx) => (
              <li key={post.id}>
                <div className='relative pb-8'>
                  {postIdx !== posts.length - 1 ? (
                    <span
                      className='absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200'
                      aria-hidden='true'
                    />
                  ) : null}
                  <div className='relative flex items-start space-x-3'>
                    <Post post={post} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default observer(Feed)
