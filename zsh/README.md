# zsh (current shell)

Plain macOS `/bin/zsh` + Homebrew plugins. Migrated from fish (see `../fish/`) — no Oh My Zsh / Oh My Fish.

## Install packages

```sh
brew install zsh-autosuggestions zsh-syntax-highlighting zoxide starship fzf mise bat lazygit neovim
brew tap olets/tap && brew trust olets/tap && brew install zsh-abbr
```

Optional (already common on this machine): `bun`, `pnpm`, `node@22`, `opencode`, `grok`.

## Install config

```sh
cp zsh/.zprofile ~/.zprofile
cp zsh/.zshrc ~/.zshrc
cp zsh/starship.toml ~/.config/starship.toml

# Secrets — never commit real values
cp zsh/.zshenv.local.example ~/.zshenv.local
chmod 600 ~/.zshenv.local
# edit ~/.zshenv.local and fill in keys
```

Point Ghostty at zsh (see `../ghostty/config`):

```
command = /bin/zsh
```

Login shell can stay fish until you are ready:

```sh
# optional, system-wide
chsh -s /bin/zsh
```

## What `.zshrc` sets up

| Piece | Role |
|---|---|
| History | Shared + append (`SHARE_HISTORY`, `INC_APPEND_HISTORY`), 50k entries |
| Completions | Homebrew `site-functions`, menu-select, case-insensitive |
| PATH | `~/.local/bin`, bun, pnpm, grok, `node@22`, optional `~/.opencode/bin` |
| Non-secret env | `OPENCODE_ENABLE_EXA`, Plane slug, Parakeet model paths |
| Secrets | Sourced from `~/.zshenv.local` only |
| Colored builtins | `ls`/`ll`/`la`, `grep`, `diff` (fish parity) |
| mise | `eval "$(mise activate zsh)"` + command-not-found hook |
| Homebrew missing-cmd | `command-not-found/handler.sh` (loaded before mise) |
| zoxide / starship | Same as fish |
| fzf | Ctrl-R history, Ctrl-T files, Alt-C cd |
| zsh-abbr | Expand-on-space abbreviations (fish `abbr` parity) |
| Autosuggestions + syntax highlighting | Homebrew plugins (highlighting last) |

## Abbreviations

Defined as **session** abbrs in `.zshrc` (expand on space):

| Abbr | Expands to |
|---|---|
| `oc` | `opencode` |
| `ocs` / `ocp` / `ocpd` / `ocl` / `ocld` | `opencode-sync …` |
| `vim` | `nvim` |
| `lg` | `lazygit` |
| `clip` | `pbcopy` |
| `cat` | `bat -p` |

Also: `alias python=python3`, `ll` / `la`.

## Secrets (`~/.zshenv.local`)

- **Do not** put API keys in `.zshrc` or this repo.
- File mode should be `600`.
- Use `zsh/.zshenv.local.example` as a checklist of variable **names** only.
- Rotate anything that previously lived in plaintext `fish/config.fish`.

## Compinit “insecure directories” warning

Homebrew often leaves `/opt/homebrew/share` group-writable. zsh then prompts on every startup.

```sh
chmod go-w /opt/homebrew/share
rm -f ~/.zcompdump*
# open a new terminal
```

`brew` updates can reintroduce group-write; re-run the `chmod` if the prompt returns.

## Verify

```sh
# in a new Ghostty tab
echo $SHELL          # /bin/zsh (Ghostty) or still fish if login shell unchanged
which zoxide starship mise bat
abbr list
oc<space>            # should expand to opencode
ll                   # colored long listing
```

## Layout

```
zsh/
  README.md                 # this file
  .zprofile                 # brew shellenv
  .zshrc                    # interactive config (no secrets)
  .zshenv.local.example     # secret name checklist — copy to ~/.zshenv.local
  starship.toml             # prompt (shell-agnostic)
```
