import { Button } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useTransition } from 'react'
import { authClient } from '~/lib/auth-client'

export function PortalButton() {
  const [isPending, startTransition] = useTransition()
  const routeApi = getRouteApi('/customer/portal')
  const navigate = routeApi.useNavigate()

  const handlePortalClick = () => {
    startTransition(async () => {
      try {
        const result = await authClient.customer.portal()

        if (result.error) {
          throw new Error(result.error.message)
        }

        console.log('Portal result:', result.data)

        navigate({ href: result.data.url })
      } catch (err) {
        console.error('Error fetching portal URL:', err)
      }
    })
  }

  return (
    <Button
      size="lg"
      leftSection={<IconExternalLink size={20} />}
      loading={isPending}
      disabled={isPending}
      onClick={handlePortalClick}
    >
      Polar管理画面を開く
    </Button>
  )
}
