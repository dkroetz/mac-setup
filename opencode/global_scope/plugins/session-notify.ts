export const SessionNotify = async ({ $ }) => ({
  event: async ({ event }) => {
    if (event.type === "session.idle") {
      await $`afplay /System/Library/Sounds/Glass.aiff`
    }
    if (event.type === "session.error") {
      await $`afplay /System/Library/Sounds/Basso.aiff`
    }
  }
})
