import { Card, Skeleton, Stack, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { z } from 'zod/v4'
import SettingsLayout from '~/features/settings/components/settings-layout'
import { ThemeForm } from '~/features/settings/components/theme-form'

const searchSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
})

export type ThemeRouteSearch = z.infer<typeof searchSchema>

export const Route = createFileRoute('/settings/theme')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function ThemeFormSkeleton() {
  return (
    <Stack gap="md">
      <Skeleton height={20} width="40%" />
      <Skeleton height={16} width="60%" />
      <Stack mt="xs" gap="sm">
        <Skeleton height={36} />
        <Skeleton height={36} />
        <Skeleton height={36} />
      </Stack>
      <Skeleton height={36} mt="md" />
    </Stack>
  )
}

function RouteComponent() {
  return (
    <SettingsLayout>
      <Stack gap="lg">
        <Title order={2}>テーマ設定</Title>

        <Card withBorder padding="lg">
          <Suspense fallback={<ThemeFormSkeleton />}>
            <ThemeForm />
          </Suspense>
        </Card>
      </Stack>
    </SettingsLayout>
  )
}
