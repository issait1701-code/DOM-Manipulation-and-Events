from pathlib import Path

html = Path('index.html').read_text(encoding='utf-8')
script = Path('task1.js').read_text(encoding='utf-8')
script = script.replace('MIN_NUMBER = 1', 'MIN_NUMBER = 40').replace('MAX_NUMBER = 20', 'MAX_NUMBER = 42').replace('START_LIVES = 3', 'START_LIVES = 1')
html = html.replace('href="styles.css"', 'href="../styles.css"').replace('<script src="task1.js" defer></script>', '')
Path('.verification/changed-game.html').write_text(html.replace('</body>', '<script>' + script + '</script></body>'), encoding='utf-8')
