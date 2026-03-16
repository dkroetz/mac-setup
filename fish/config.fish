if status is-interactive
    zoxide init fish | source
    starship init fish | source
    set EDITOR zed
end

# Global aliases
abbr --add oc opencode
abbr --add vim nvim
abbr --add lg lazygit
abbr --add python python3
abbr --add clip pbcopy
abbr --add cat "bat -p"

# Global env vars
## Opencode
set -gx OPENCODE_ENABLE_EXA 1

## Lazygit config dir
set -gx XDG_CONFIG_HOME "$HOME/.config"

## zoxide conf
set -gx _ZO_EXCLUDE_DIRS "/tmp:/var:/proc:/sys:/.venv:/node_modules:/__pycache__"