import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useStores } from '@lib/root-store-context'

export default function FollowBox() {
  const subscribeToUser = useStores().subscribeToUser

  // useStore((s) => s.oauthdata)
  // const geolocation = useStore((s) => s.geolocation)
  const { register, errors, handleSubmit, formState, reset, watch } = useForm({
    // defaultValues,
    mode: 'onChange',
  })

  const { isValid, isDirty } = formState

  const submitPost = async ({ content }) => {
    await subscribeToUser(content)

    reset({ content: '' })

    toast.success('Key added')
  }

  return (
    <div className='flex items-start space-x-4 m-8 w-full max-w-xl'>
      <div className='min-w-0 flex-1'>
        <form onSubmit={handleSubmit(submitPost)} className='relative'>
          <div className='border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'>
            <label htmlFor='comment' className='sr-only'>
              Write a post
            </label>
            <textarea
              name='content'
              ref={register({
                maxLength: { value: 200, message: 'Key is too long' },
                minLength: { value: 10, message: 'Key is too short' },
                required: { value: true, message: 'Key is required' },
              })}
              rows={1}
              id='content'
              className='block w-full py-3 border-0 resize-none focus:ring-0 sm:text-sm'
              placeholder='Follow a key'
              defaultValue={''}
            />

            {/* Spacer element to match the height of the toolbar */}
            <div className='py-2' aria-hidden='true'>
              {/* Matches height of button in toolbar (1px border + 36px content height) */}
              <div className='py-px'>
                <div className='h-9' />
              </div>
            </div>
          </div>

          <div className='absolute bottom-0 inset-x-0 pl-3 pr-2 py-2 flex justify-between'>
            <div className='flex items-center space-x-5'>
              {errors.content && <p className='text-gray-500'>{errors.content.message}</p>}
              {/* <div className='flex items-center'>
                <button
                  type='button'
                  className='-m-2.5 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-500'
                >
                  <PaperClipIcon className='h-5 w-5' aria-hidden='true' />
                  <span className='sr-only'>Attach a file</span>
                </button>
              </div> */}
            </div>
            <div className='flex-shrink-0'>
              <button
                type='submit'
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                disabled={!isDirty || !isValid}
              >
                Follow
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}