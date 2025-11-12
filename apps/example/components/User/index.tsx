'use client'

import { use } from 'react'

import { UserView, type UserData } from './View';
export { UserView } from './View';
export type { UserData } from './View';

export const User = ({ userPromise }: { userPromise: Promise<UserData> }) => {
  const user = use(userPromise)
  return <UserView user={user} />
}
