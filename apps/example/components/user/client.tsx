'use client'

import { use } from 'react'

import { User as UserComponent } from './index'

export type UserData = {
  image: string
  name: string
  description: string
}

export const User = ({ userPromise }: { userPromise: Promise<UserData> }) => {
  const user = use(userPromise)
  return <UserComponent user={user} />
}
