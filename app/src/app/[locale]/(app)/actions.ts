'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function handleLogout() {
  await auth.api.signOut({
    headers: await headers(),
  })

  redirect('/en')
}
