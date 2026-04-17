# Changelog

## [2.0.0] - 2026-04-16

### Added
- Initial release of Ollama Rule Evaluator POC
- Markdown-based configuration file support
- Configurable Ollama connection settings (IP, port, model)
- Rule definitions via prompts in config.md
- Input from stdin or file
- Interactive mode for testing
- Multiple rule execution support
- No external markdown library dependency
- Comprehensive README documentation
- Example config with 5 rules (spam_detection, sentiment_analysis, safety_check, length_analysis, format_detection)
- Example test_input.txt

### Technical Details
- Pure Python implementation using only standard library + requests
- Built-in markdown renderer (no external dependencies)
- Robust error handling for Ollama connections
- JSON output from Ollama responses
- Timeout handling for remote Ollama services

### Usage
```bash
# Basic usage
echo "text" | python3 ollama_evaluator.py --config config.md

# File input
python3 ollama_evaluator.py --config config.md --input input.txt

# Specific rules
python3 ollama_evaluator.py --config config.md --rules rule1,rule2

# Interactive mode
python3 ollama_evaluator.py --config config.md
```
