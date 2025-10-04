import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context, location }) => {
    const noCheckPaths = ['/auth/sign-out', '/auth/passkey-setup']

    if (noCheckPaths.some((path) => location.pathname.startsWith(path))) {
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
