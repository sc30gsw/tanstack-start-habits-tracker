import { OnboardingTour } from '@gfazioli/mantine-onboarding-tour'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import '@gfazioli/mantine-onboarding-tour/styles.css'
import { IconShare } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import { useId } from 'react'
import { habitDto } from '~/features/habits/server/habit-functions'
import { recordDto } from '~/features/habits/server/record-functions'
import { searchSchema } from '~/features/habits/types/schemas/search-params'
import { getDataFetchDateRange } from '~/features/habits/utils/completion-rate-utils'
import { DailyHabitList } from '~/features/home/components/daily-habit-list'
import { HomeCalendarView } from '~/features/home/components/home-calendar-view'
import { HomeHeatmapView } from '~/features/home/components/home-heatmap-view'
import { ShareHabitsModal } from '~/features/home/components/share-habits-modal'
import { CTASection } from '~/features/landing/components/cta-section'
import { FeaturesSection } from '~/features/landing/components/features-section'
import { HeroSection } from '~/features/landing/components/hero-section'
import { HowItWorksSection } from '~/features/landing/components/how-it-works-section'
import { LandingFooter } from '~/features/landing/components/landing-footer'
import { MarqueeSection } from '~/features/landing/components/marquee-section'
import { ProductShowcaseSection } from '~/features/landing/components/product-showcase-section'
import { TestimonialsSection } from '~/features/landing/components/testimonials-section'
import { ValuePropositionsSection } from '~/features/landing/components/value-propositions-section'
import { OnboardingHabitProgressStepper } from '~/features/onboarding/components/onboarding-habit-stepper'
import { OnboardingTriggerButton } from '~/features/onboarding/components/onboarding-trigger-button'
import { STEPS } from '~/features/onboarding/constants/tour-steps'
import { useOnboardingTour } from '~/features/onboarding/hooks/use-onboarding-tour'
import { auth } from '~/lib/auth'

dayjs.locale('ja')

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await auth.api.getSession(getRequest())

  return session
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  component: Home,
  beforeLoad: async ({ search, context }) => {
    const session = await getSession()

    context.isAuthenticated = !!session?.user

    return { search, context }
  },
  loader: async ({ context }) => {
    if (!context.isAuthenticated) {
      return {
        isAuthenticated: false,
        habits: { success: false, data: [] },
        records: { success: false, data: [] },
      }
    }

    // ヒートマップ(今日から1年分) + カレンダーグリッド(42日分)の範囲を取得
    const { dateFrom, dateTo } = getDataFetchDateRange(context.search.currentMonth)

    const [habitsResult, recordsResult] = await Promise.all([
      habitDto.getHabits({
        data: {
          q: '',
          habitSort: 'all',
          habitFilter: 'all',
        },
      }),
      recordDto.getRecords({
        data: {
          date_from: dateFrom,
          date_to: dateTo,
        },
      }),
    ])

    return {
      isAuthenticated: true,
      habits: habitsResult,
      records: recordsResult,
    }
  },
})

function Home() {
  const loaderData = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()
  const copyId = useId()
  const { started, handlers } = useOnboardingTour()

  if (!loaderData.isAuthenticated) {
    return (
      <>
        <HeroSection />
        <ProductShowcaseSection />
        <ValuePropositionsSection />
        <FeaturesSection />
        <MarqueeSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
        <LandingFooter />
      </>
    )
  }

  const { habits, records } = loaderData

  const today = dayjs().format('YYYY-MM-DD')
  const selectedDate = searchParams.selectedDate ?? today

  const totalHabits = habits.success ? (habits.data?.length ?? 0) : 0
  const totalRecords = records.success ? (records.data?.length ?? 0) : 0

  const completedOnSelectedDate = records.success
    ? (records.data?.filter((r) => r.date === selectedDate && r.status === 'completed').length ?? 0)
    : 0

  return (
    <OnboardingTour
      tour={STEPS.HOME}
      started={started}
      onOnboardingTourEnd={handlers.onEnd}
      onOnboardingTourClose={handlers.onClose}
      stepper={OnboardingHabitProgressStepper}
    >
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Box data-onboarding-tour-id="welcome">
            <Flex align="center" gap="xs" mb="sm">
              <Title order={1}>Track - 習慣追跡アプリ</Title>
              <OnboardingTriggerButton variant="inline" onClick={handlers.onStart} />
            </Flex>
            <Text size="lg" c="gray.7">
              日々の習慣を記録し、継続状況を可視化しましょう
            </Text>
          </Box>

          <Group gap="lg" data-onboarding-tour-id="stats-overview">
            <Card withBorder padding="lg" style={{ flex: 1, minHeight: '100px' }}>
              <Text c="dimmed" size="sm" mb="xs">
                登録習慣数
              </Text>
              <Text size="xl" fw={700}>
                {totalHabits}
              </Text>
            </Card>

            <Card withBorder padding="lg" style={{ flex: 1, minHeight: '100px' }}>
              <Text c="dimmed" size="sm" mb="xs">
                総記録数
              </Text>
              <Text size="xl" fw={700}>
                {totalRecords}
              </Text>
            </Card>

            <Card withBorder padding="lg" style={{ flex: 1, minHeight: '100px' }}>
              <Text
                c="dimmed"
                size="sm"
                mb="xs"
                lineClamp={2}
                title={
                  selectedDate === today
                    ? '今日の完了数'
                    : `${dayjs(selectedDate).format('YYYY年M月D日')}の完了数`
                }
              >
                {selectedDate === today
                  ? '今日の完了数'
                  : `${dayjs(selectedDate).format('YYYY/M/D')}の完了数`}
              </Text>
              <Text size="xl" fw={700} c="green">
                {completedOnSelectedDate}
              </Text>
            </Card>
          </Group>

          <Card withBorder padding="lg" data-onboarding-tour-id="quick-action">
            <Stack gap="md">
              <Text size="lg" fw={500}>
                今日の習慣を記録しましょう
              </Text>
              <Group gap="md">
                <Button component={Link} to="/habits" size="lg">
                  習慣一覧
                </Button>
                {totalHabits > 0 && (
                  <Badge variant="light" color="blue" size="lg">
                    {totalHabits}つの習慣が登録済み
                  </Badge>
                )}
              </Group>
            </Stack>
          </Card>

          <Box data-onboarding-tour-id="calendar-view">
            <HomeCalendarView />
          </Box>

          <Card withBorder padding="lg" data-onboarding-tour-id="daily-habits">
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Box id={copyId}>
                  <Text size="xl" fw={600}>
                    {selectedDate === today
                      ? '今日の完了習慣'
                      : `${dayjs(selectedDate).format('M月D日')}の完了習慣`}
                  </Text>
                  {completedOnSelectedDate > 0 && (
                    <Text size="xs" c="dimmed" mt={4}>
                      {completedOnSelectedDate}件の習慣を完了しました
                    </Text>
                  )}
                </Box>
                {completedOnSelectedDate > 0 && (
                  <Button
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    size="sm"
                    leftSection={<IconShare size={16} />}
                    onClick={() => {
                      navigate({
                        search: (prev) => ({ ...prev, open: true }),
                        hash: copyId,
                      })
                    }}
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        },
                      },
                    }}
                  >
                    共有
                  </Button>
                )}
              </Group>
              <Divider />

              <DailyHabitList />
            </Stack>
          </Card>

          <Box data-onboarding-tour-id="heatmap-view">
            <HomeHeatmapView />
          </Box>
        </Stack>
        <ShareHabitsModal copyId={copyId} />
      </Container>
      <OnboardingTriggerButton variant="floating" onClick={handlers.onStart} />
    </OnboardingTour>
  )
}
