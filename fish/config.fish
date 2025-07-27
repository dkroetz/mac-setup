if status is-interactive
    zoxide init fish | source
    starship init fish | source
    abbr --add vim nvim
    abbr --add lg lazygit
    set EDITOR nvim
end
