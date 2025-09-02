import fs from 'node:fs'
import { createServerFn } from '@tanstack/react-start'
import { countSchema } from '~/features/root/types/schemas/count-schema'

const filePath = './src/count.txt'

async function readCount() {
  return parseInt(await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'), 10)
}

const getCount = createServerFn({ method: 'GET' }).handler(async (): Promise<number> => {
  return await readCount()
})

const updateCount = createServerFn({ method: 'POST' })
  .validator(countSchema)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises.writeFile(filePath, `${count + data.count}`)
  })

export const countDto = {
  getCount,
  updateCount,
} as const
