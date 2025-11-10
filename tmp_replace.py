from pathlib import Path
path = Path('components/analysis-workbench/folder-analysis/folder-analysis-progress.tsx')
text = path.read_text()
text = text.replace("'✓'", "'done'")
path.write_text(text)
