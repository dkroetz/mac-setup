if status is-interactive
    zoxide init fish | source
    starship init fish | source
    abbr --add vim nvim
    abbr --add lg lazygit
    abbr --add ocs "opencode-sync status"
    abbr --add ocp "opencode-sync push"
    abbr --add ocpd "opencode-sync push --dry-run"
    abbr --add ocl "opencode-sync pull"
    abbr --add ocld "opencode-sync pull --dry-run"
    set EDITOR nvim
end
