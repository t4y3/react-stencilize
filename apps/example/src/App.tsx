import { Suspense } from 'react';
import { User as UserComponent, type UserData } from '../components/user';
import { User } from '../components/user/client.tsx';
import withSkeleton from '../components/user/withSkeleton';

const SkeletonUser = withSkeleton(UserComponent);

const fetchUser = async (delay: number): Promise<UserData> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return {
      image: 'https://picsum.photos/id/318/400/400',
      name: 'John Doe',
      description: 'Software Engineer at Example Corp'
  };
};

function App() {
  const userPromise1 = fetchUser(2000);
  const userPromise2 = fetchUser(3000);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">withSkeleton Examples</h1>

      {/* Example 1: Basic skeleton usage */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 1: Basic Skeleton</h2>
        <Suspense fallback={<SkeletonUser />}>
          <User userPromise={userPromise1} />
        </Suspense>
      </div>

      {/* Example 2: Skeleton with additional props */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 2: Skeleton with Props</h2>
        <Suspense fallback={null}>
          <User userPromise={userPromise2} />
        </Suspense>
      </div>
    </div>
  )
}

export default App
