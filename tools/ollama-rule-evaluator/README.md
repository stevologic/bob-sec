# Ollama Rule Evaluator POC

## Overview

A Python proof-of-concept tool that evaluates text against rules defined in a Markdown configuration file, using an offline Ollama model for AI analysis.

## Features

- Read input from stdin or file
- Load rules from a Markdown config file
- Configure Ollama connection (IP/port/model) in config
- Send text to offline Ollama model for analysis
- Display results with citations

## Requirements

- Python 3.8+
- Ollama running on a remote system (or local)
- `python3-requests` package

## Installation

```bash
pip3 install requests
# or
apt-get install python3-requests
```

## Usage

### Basic Example (stdin)
```bash
echo "This is a sample text to analyze." | python3 ollama_evaluator.py --config config.md
```

### File Input
```bash
python3 ollama_evaluator.py --config config.md --input input.txt
```

### Config File Format
The config file is a Markdown document with two main sections:

1. **Ollama Settings** - Connection configuration
2. **Rules** - Rule definitions with prompts

### Example Config File (config.md)
```markdown
# Rule Evaluator Configuration

## Ollama Settings
ip_address: 127.0.0.1  # or remote IP
port: 11434
model: llama3.2:1b

## Rules
### spam_detection
**Prompt:**
"Detect if the following text is spam. Respond with JSON: {is_spam: boolean, confidence: 0-1, reason: string}

Text:
{text}"
```

## Config File Structure

The config file is a Markdown document with:

- Ollama Settings section with ip_address, port, model
- Rules section with named rules containing prompts

### Example Config File (config.md)
```markdown
# Rule Evaluator Configuration

## Ollama Settings
ip_address: 127.0.0.1  # or remote IP
port: 11434
model: llama3.2:1b

## Rules
### spam_detection
**Prompt:**
"Detect if the following text is spam. Respond with JSON: {is_spam: boolean, confidence: 0-1, reason: string}

Text:
{text}"

### sentiment_analysis
**Prompt:**
"Analyze the sentiment of this text. Respond with JSON: {sentiment: positive|negative|neutral, score: -1 to 1}

Text:
{text}"
```

## Running the Script

```bash
# Interactive mode
python3 ollama_evaluator.py --config config.md

# With input file
python3 ollama_evaluator.py --config config.md --input test.txt

# Specify rules to run
python3 ollama_evaluator.py --config config.md --rules spam_detection,sentiment_analysis
```

## Output Format

The script outputs results for each rule as JSON with:
- Rule name
- Confidence score
- Analysis result
- Ollama response

## Testing

```bash
# Test with sample input
echo "Hello world!" | python3 ollama_evaluator.py --config config.md
```

## Notes

- Ollama must be accessible from the system
- Ensure the model is loaded before running
- Config file can be edited to add new rules
- Supports remote Ollama servers by changing ip_address in config
