if status is-interactive
    zoxide init fish | source
    starship init fish | source
    source ~/.aliases
    set EDITOR nvim
end
