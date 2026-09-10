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

# Completions (Homebrew site-functions)
fpath=(
  /opt/homebrew/share/zsh/site-functions
  $fpath
)
autoload -Uz compinit
if [[ -n ${ZDOTDIR:-$HOME}/.zcompdump(#qN.mh+24) ]]; then
  compinit
else
  compinit -C
fi

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
  (( $+commands[mise] )) && eval "$(mise activate zsh)"

  eval "$(zoxide init zsh)"
  eval "$(starship init zsh)"
  export EDITOR=zed

  # fzf keybindings/completions
  [[ -f /opt/homebrew/opt/fzf/shell/key-bindings.zsh ]] && source /opt/homebrew/opt/fzf/shell/key-bindings.zsh
  [[ -f /opt/homebrew/opt/fzf/shell/completion.zsh ]] && source /opt/homebrew/opt/fzf/shell/completion.zsh

  # Lightweight command shortcuts. Avoid zsh-abbr's cross-shell startup lock.
  alias oc=opencode
  alias vim=nvim
  alias lg=lazygit
  alias clip=pbcopy
  alias cat='bat -p'

  [[ -f /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh ]] && source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
  # Must be last among widget-related plugins
  [[ -f /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh ]] && source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
fi

export PATH="/opt/homebrew/opt/openjdk/bin:$PATH"
