import {Suspense} from 'react'
import {withStencil} from 'react-stencilize'
import {User, UserView, type UserData} from '../components/user'
import {Code} from "../components/Code";
import { codeToHtml } from "shiki";


const SkeletonUser = withStencil(UserView)

const fetchUser = async (delay: number): Promise<UserData> => {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return {
    image: 'https://picsum.photos/id/318/400/400',
    name: 'John Doe',
    description: 'Software Engineer at Example Corp',
  }
}

function App() {
  const userPromise1 = fetchUser(2000)
  const codePromise = codeToHtml(`export type UserData = {
  image: string
  name: string
  description: string
}

export const UserView = ({ user }: { user: UserData }) => {
  return (
    <div className="flex">
      <div className="mr-4 shrink-0">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="size-16 border border-gray-300 bg-white text-gray-300 dark:border-white/15 dark:bg-gray-900 dark:text-white/15"
        >
          <path d="M0 0l200 200M0 200L200 0" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white ss-text-[4]">{user.name}</h4>
        <p className="mt-1 text-gray-500 dark:text-gray-400 ss-text-[16]">{user.description}</p>
      </div>
    </div>
  )
}`, {
    lang: 'html',
    theme: 'light-plus'
  });
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">withSkeleton Examples</h1>
      <Suspense>
        <Code code={codePromise} />
      </Suspense>
      {/* Example 1: Basic skeleton usage */}
      <div>
        <Suspense fallback={<SkeletonUser/>}>
          <User userPromise={userPromise1}/>
        </Suspense>
      </div>

    </div>
  )
}

export default App
