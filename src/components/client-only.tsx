import type React from 'react'
import { useEffect, useState } from 'react'
import { Loader } from '~/components/ui/loader'

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Loader />
  }

  return children
}
