import {SandpackProvider, SandpackLayout, SandpackCodeEditor, SandpackPreview} from '@codesandbox/sandpack-react'

const sandpackFiles = {
  '/App.tsx': `import { Suspense } from "react";
import { withStencil } from "react-stencilize";
import { User } from "./User";
import { UserView, type UserData } from "./User/View";

const SkeletonUser = withStencil(UserView);

const fetchUser = async (delay: number): Promise<UserData> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return {
    name: "John Doe",
    description: "Software Engineer at Example Corp",
  };
};

export default function App() {
  const userPromise = fetchUser(1200);

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">UserView</h1>
        <Suspense>
          <UserView user={{ name: "John Doe", description: "Software Engineer at Example Corp", }} />
        </Suspense>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">UserView x withStencil</h1>
        <Suspense>
          <SkeletonUser />
        </Suspense>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Suspense x use</h1>
        <Suspense fallback={<SkeletonUser />}>
          <User userPromise={userPromise} />
        </Suspense>
      </div>
    </div>
  );
}
`,
  '/User.tsx': `import { use } from "react";
import { UserView, type UserData } from "./User/View";

export const User = ({ userPromise }: { userPromise: Promise<UserData> }) => {
  const user = use(userPromise);
  return <UserView user={user} />;
};
`,
  '/User/View.tsx': `export type UserData = {
  name: string;
  description: string;
};

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
        <h4 className="text-lg font-semibold text-slate-900">{user.name}</h4>
        <p className="mt-1 text-slate-600">{user.description}</p>
      </div>
    </div>
  );
};
`,
}

function App() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <SandpackProvider
          template="react-ts"
          customSetup={{
            dependencies: {
              react: '19.2.0',
              'react-dom': '19.2.0',
              'react-stencilize': '1.0.2',
            },
          }}
          files={sandpackFiles}
          options={{
            classes: {
              "sp-layout-height": "h-96",
            },
            externalResources: ['https://cdn.tailwindcss.com'],
          }}
        >
          <SandpackLayout className="[--sp-layout-height:800px]">
            <SandpackCodeEditor />
            <SandpackPreview />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}

export default App
