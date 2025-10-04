import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context, location }) => {
    if (location.pathname === '/auth/sign-out') {
      return
    }

    if (context.session) {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
