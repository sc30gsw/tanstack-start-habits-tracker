import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context, location }) => {
    const noCheckPaths = [
      '/auth/sign-out',
      '/auth/passkey-setup',
    ] as const satisfies readonly string[]

    if (noCheckPaths.includes(location.pathname as (typeof noCheckPaths)[number])) {
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
