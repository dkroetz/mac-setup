if status is-interactive
    zoxide init fish | source
    starship init fish | source
    set EDITOR zed
end

# Global aliases
abbr --add vim nvim
abbr --add lg lazygit
abbr --add python python3
abbr --add clip pbcopy

# Global env vars
## Opencode
set -gx OPENCODE_ENABLE_EXA 1
