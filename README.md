# VSCode Setup
## Custom settings
```json
{
    "window.zoomLevel": 1,
    "workbench.startupEditor": "newUntitledFile",
    "workbench.iconTheme": "ayu",
    "workbench.colorTheme": "GitHub Dark Dimmed",
    "workbench.settings.editor": "json",
    "workbench.settings.openDefaultSettings": true,
    "python.defaultInterpreterPath": "C:\\Users\\Thor\\AppData\\Local\\Programs\\Python\\Python310\\python.exe",
    "kite.showWelcomeNotificationOnStartup": false,
    "editor.fontSize": 15,
    "editor.fontWeight": "550",
    "editor.fontFamily": "Source Code Pro",
    "editor.formatOnSave": true,
    "debug.console.fontFamily": "Source Code Pro",
    "debug.console.fontSize": 15,
    "terminal.integrated.fontSize": 14,
    "terminal.integrated.fontWeight": 550,
    "terminal.integrated.fontFamily": "Source Code Pro",
    "terminal.integrated.shell.windows": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    "extensions.ignoreRecommendations": true,
    "python.formatting.provider": "black",
    "python.linting.pylintArgs": [
        "--disable=C0111"
    ],
    "code-runner.executorMap": {
        "python": "$pythonPath -u $fullFileName"
    },
    "code-runner.clearPreviousOutput": true,
    "git.useEditorAsCommitInput": false,
    "editor.stickyScroll.enabled": true,
    "editor.tokenColorCustomizations": {
        "[GitHub Dark Dimmed]": {
            "textMateRules": [
                {
                    "scope": "variable.other.readwrite",
                    "settings": {
                        "foreground": "#ff00f7",
                        "fontStyle": "bold"
                    }
                }
            ]
        }
    },
    "git.enableSmartCommit": true
}
```

## Visual
Font: Source Code Pro
https://github.com/adobe-fonts/source-code-pro

## Extensions
- Python
- AREPL for python
- KITE AutoComplete
- Code-Runner
