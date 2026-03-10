export const EnvProtection = async () => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "read") {
      const path = output.args.filePath || ""
      if (/\.(env|pem|key|secret|credentials)/.test(path) ||
          path.includes(".secrets/")) {
        throw new Error(`Blocked: reading sensitive file ${path}`)
      }
    }
  }
})
