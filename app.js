// @ts-check
import { Client, IntentsBitField } from 'discord.js'
import 'dotenv/config'

const DEBOUNCE_TIMER = new Map()

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildPresences]
})

await client.login(process.env.TOKEN)

client.on('guildMemberUpdate', async (prev, next) => {
  const changes = next.roles.cache.difference(prev.roles.cache)

  // Если роль фанклаба не изменена
  if (!changes.has(process.env.FUNCLUB_ROLE_ID)) {
    return
  }

  // Если роль фанклаба или токсика в наличии
  if (
    next.roles.cache.has(process.env.FUNCLUB_ROLE_ID) ||
    next.roles.cache.has(process.env.TOXIC_ROLE_ID)
  ) {
    return
  }

  // Делаем задержку в 5000 мс чтобы дождаться следующей смены роли (если вдруг добавляется роль токсика)
  let timer = DEBOUNCE_TIMER.get(next.id)
  if (timer) {
    clearTimeout(timer)
    DEBOUNCE_TIMER.delete(next.id)
  }

  DEBOUNCE_TIMER.set(
    next.id,
    setTimeout(() => {
      next.roles.add(process.env.FUNCLUB_ROLE_ID)
    }, 5000)
  )
})