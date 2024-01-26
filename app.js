// @ts-check
import { Client, IntentsBitField } from 'discord.js'
import 'dotenv/config'

const DEBOUNCE_TIMER = new Map()

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildPresences
  ]
})

await client.login(process.env.TOKEN)

console.log(`logged in as ${client.user?.displayName} (${client.user?.id})`)

client.on('guildMemberUpdate', async (prev, next) => {
  const changes = next.roles.cache.difference(prev.roles.cache)

  // Если роль фанклаба не изменена
  if (!changes.has(process.env.FUNCLUB_ROLE_ID)) {
    console.log(`no changes for ${next.user.username} (${next.id})`)
    return
  }

  // Если роль фанклаба или токсика в наличии
  if (
    next.roles.cache.has(process.env.FUNCLUB_ROLE_ID) ||
    next.roles.cache.has(process.env.TOXIC_ROLE_ID)
  ) {
    console.log(`has role ${next.user.username} (${next.id})`)
    return
  }

  // Делаем задержку в 5000 мс чтобы дождаться следующей смены роли (если вдруг добавляется роль токсика)
  let timer = DEBOUNCE_TIMER.get(next.id)
  if (timer) {
    clearTimeout(timer)
    DEBOUNCE_TIMER.delete(next.id)
  }

  console.log(`enqueuing ${next.user.username} (${next.id})`)
  DEBOUNCE_TIMER.set(
    next.id,
    setTimeout(() => {
      console.log(`adding role to ${next.user.username} (${next.id})`)
      next.roles.add(process.env.FUNCLUB_ROLE_ID)
    }, 5000)
  )
})
