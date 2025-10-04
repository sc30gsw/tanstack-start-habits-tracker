import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { authClient } from '~/lib/auth-client'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession()
  const navigate = Route.useNavigate()

  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: '/' as const })
    }
  }, [session, isPending, navigate])

  return <Outlet />
}
