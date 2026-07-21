# PATH / tooling already partly set in ~/.zprofile (brew) and below.

alias python="python3"

# History (fish-like: shared across sessions, append immediately)
HISTFILE=${HISTFILE:-$HOME/.zsh_history}
HISTSIZE=50000
SAVEHIST=50000
setopt SHARE_HISTORY
setopt INC_APPEND_HISTORY
setopt EXTENDED_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_REDUCE_BLANKS
setopt HIST_VERIFY

# Completions (Homebrew site-functions + zsh-abbr)
fpath=(
  /opt/homebrew/share/zsh/site-functions
  /opt/homebrew/share/zsh-abbr
  $fpath
)
autoload -Uz compinit && compinit

# Completion UX closer to fish's pager
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list \
  'm:{[:lower:][:upper:]}={[:upper:][:lower:]}' \
  'r:|[._-]=* r:|=*' \
  'l:|=* r:|=*'
zstyle ':completion:*' list-colors ''

# PATH (deduped)
export BUN_INSTALL="$HOME/.bun"
export PNPM_HOME="$HOME/Library/pnpm"

typeset -U path
path=(
  "$HOME/.local/bin"
  "$BUN_INSTALL/bin"
  "$PNPM_HOME"
  "$HOME/.grok/bin"
  /opt/homebrew/opt/node@22/bin
  $path
)
# Legacy opencode installer path (brew opencode is already on PATH)
[[ -d "$HOME/.opencode/bin" ]] && path=("$HOME/.opencode/bin" $path)

# Non-secret env (secrets live in ~/.zshenv.local)
export OPENCODE_ENABLE_EXA=1
export PLANE_WORKSPACE_SLUG=your-workspace-slug
export PARAKEET_TDT_MODEL_DIR="$HOME/Library/Application Support/parakeet/models/parakeet-tdt-0.6b-v3"
export PARAKEET_SORTFORMER_MODEL="$HOME/Library/Application Support/parakeet/models/sortformer/diar_streaming_sortformer_4spk-v2.1.onnx"

[[ -f "$HOME/.zshenv.local" ]] && source "$HOME/.zshenv.local"

# Match fish's built-in colored wrappers (ls/grep/diff) and la/ll
ls() {
  if [[ -t 1 ]]; then
    command ls --color=auto -F "$@"
  else
    command ls --color=auto "$@"
  fi
}
alias ll='ls -lh'
alias la='ls -lAh'
alias grep='grep --color=auto'
alias diff='diff --color=auto'

# Interactive tools
if [[ -o interactive ]]; then
  # Homebrew tips for missing commands (before mise, which wraps this handler)
  source /opt/homebrew/Library/Homebrew/command-not-found/handler.sh

  # mise: fish gets this via brew vendor_conf.d; zsh needs an explicit activate
  eval "$(mise activate zsh)"

  eval "$(zoxide init zsh)"
  eval "$(starship init zsh)"
  export EDITOR=zed

  # fzf keybindings/completions
  [[ -f /opt/homebrew/opt/fzf/shell/key-bindings.zsh ]] && source /opt/homebrew/opt/fzf/shell/key-bindings.zsh
  [[ -f /opt/homebrew/opt/fzf/shell/completion.zsh ]] && source /opt/homebrew/opt/fzf/shell/completion.zsh

  # Expand-on-space abbreviations (fish abbr parity); session-scoped from this file
  source /opt/homebrew/share/zsh-abbr/zsh-abbr.zsh
  abbr -S --quiet oc=opencode
  abbr -S --quiet ocs='opencode-sync status'
  abbr -S --quiet ocp='opencode-sync push'
  abbr -S --quiet ocpd='opencode-sync push --dry-run'
  abbr -S --quiet ocl='opencode-sync pull'
  abbr -S --quiet ocld='opencode-sync pull --dry-run'
  abbr -S -qq --force vim=nvim
  abbr -S --quiet lg=lazygit
  abbr -S --quiet clip=pbcopy
  abbr -S -qq --force 'cat=bat -p'

  source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
  # Must be last among widget-related plugins
  source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
fi
