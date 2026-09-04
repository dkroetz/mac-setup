# Bug from Akko Keyboard
if < and ^ are swapped

sudo plutil -convert xml1 /Library/Preferences/com.apple.keyboardtype.plist

Edit file /Library/Preferences/com.apple.keyboardtype.plist and change type 43 to 41 (or the other way round)

# Installation
## ghostty
Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.
[ghostty](https://ghostty.org/)
```sh
brew install --cask ghostty
cp ghostty/config ~/Library/Application\ Support/com.mitchellh.ghostty/config
brew install neovim
```

## zsh (current)
Plain macOS zsh + Homebrew plugins (migrated from fish). Full write-up: [`zsh/README.md`](zsh/README.md).

```sh
brew install zsh-autosuggestions zsh-syntax-highlighting zoxide starship fzf mise bat lazygit

cp zsh/.zprofile ~/.zprofile
cp zsh/.zshrc ~/.zshrc
cp zsh/starship.toml ~/.config/starship.toml

# Secrets stay out of git — fill locally only
cp zsh/.zshenv.local.example ~/.zshenv.local
chmod 600 ~/.zshenv.local
```

Ghostty is set to `command = /bin/zsh`. Login shell can stay fish until you run `chsh -s /bin/zsh`.

## herdr
terminal agent multiplexer (tmux on steroids)
[herdr](https://herdr.dev/)
```sh
brew install herdr
cp herdr/config.toml ~/.config/herdr/config.toml
```

## pi
terminal coding agent (pi-coding-agent).
```sh
npm install -g @earendil-works/pi-coding-agent
cp pi/settings.json ~/.pi/agent/settings.json
cp pi/mcp.json ~/.pi/agent/mcp.json
cp pi/extensions/*.ts ~/.pi/agent/extensions/
```

## fish (previous)
fish is a smart and user-friendly command line shell for Linux, macOS, and the rest of the family.
Kept for reference / fallback — current interactive shell is zsh (see above).
[fish](https://fishshell.com/)
```sh
brew install fish
cp fish/config.fish ~/.config/fish/
```

### fisher
fisher is a plugin manager for fish shell.
[fisher](https://github.com/jorgebucaran/fisher)
```sh
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
```

## autoenv.fish
A Fish Shell plugin that automatically loads environment variables from a .env file in the current project.
[autoenv.fish](https://github.com/SpaceShaman/autoenv.fish)
```sh
fisher install SpaceShaman/autoenv.fish
```

## zoxide
zoxide is a smarter cd command, inspired by z and autojump.
It remembers which directories you use most frequently, so you can "jump" to them in just a few keystrokes.
Included in the zsh setup above; still useful standalone.
[GitHub - zoxide](https://github.com/ajeetdsouza/zoxide)
```sh
brew install zoxide
brew install fzf # optional - see docs
```

## starship
The minimal, blazing-fast, and infinitely customizable prompt for any shell!
[starship](https://starship.rs/)
```sh
brew install starship
cp zsh/starship.toml ~/.config/starship.toml
# legacy fish path still works: cp fish/starship.toml ~/.config/
```

## lazygit
A simple terminal UI for git commands.
[lazygit](https://github.com/jesseduffield/lazygit)
```sh
brew install lazygit
```

## obsidian
Note taking and knowledge management application.
[obsidian](https://obsidian.md/)
```sh
mkdir -p MyNewVault
cp obsidian/ MyNewVault
```

## raycast
Raycast is a powerful launcher for macOS that allows you to quickly access your apps, files, and web searches.
[raycast](https://raycast.com/)
```sh
brew install raycast
```

## vscode
Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.
[vscode](https://code.visualstudio.com/)
```sh
brew install vscode
```

## zed
Zed is a code editor based on rust.
[zed](https://zed.dev/)

## zen
Zen is a web browser that is fast, secure, and easy to use.
[zen](https://zen-browser.app/)
