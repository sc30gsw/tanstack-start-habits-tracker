import { createFileRoute, useRouter } from '@tanstack/react-router'
import { countDto } from '~/features/root/server/count-dto'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await countDto.getCount(),
})

function Home() {
  const state = Route.useLoaderData()
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        countDto.updateCount({ data: 2 }).then(() => router.invalidate())
      }}
      className="cursor-pointer rounded-md px-4 py-2 outline hover:bg-slate-200/50"
    >
      Add 1 {state}
    </button>
  )
}
