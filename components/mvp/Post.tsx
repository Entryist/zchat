import { Event } from '@lib/mst'
import Image from 'next/image'

export default function Post({ post }: { post: Event }) {
  // console.log('post:', post)
  if (!post.content) return <></>
  // @ts-ignore
  const datetime = post.createdAt * 1000
  return (
    <>
      <div className='relative'>
        <div className='h-10 w-10 flex items-center justify-center ring-8 ring-white'>
          <Image className='rounded-full bg-gray-400' src='/user.png' layout='fill' alt='' />
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm'>
            <div className='font-medium text-gray-900'>{`${post.pubkey}`}</div>
          </div>
          <p className='mt-0.5 text-sm text-gray-500'>
            Posted at {new Date(datetime).toLocaleString()}{' '}
          </p>
        </div>
        <div className='mt-2 text-sm text-gray-700'>
          <p>{post.content}</p>
        </div>
      </div>
    </>
  )
}
