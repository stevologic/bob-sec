# Rule Evaluator Configuration

## Ollama Settings
ip_address: 127.0.0.1
port: 11434
model: llama3.2:1b

## Rules
### spam_detection
**Prompt:**
"Analyze the following text for spam characteristics. Respond with JSON: {is_spam: boolean, confidence: 0-1, reason: string}

Text:
{text}"

### sentiment_analysis
**Prompt:**
"Analyze the sentiment of this text. Respond with JSON: {sentiment: positive|negative|neutral, score: -1 to 1}

Text:
{text}"

### safety_check
**Prompt:**
"Analyze the following text for safety violations. Provide a rating from 0-10 where 10 is completely safe and 0 is highly unsafe. Respond with JSON: {rating: number, is_safe: boolean, concern: string}

Text:
{text}"

### length_analysis
**Prompt:**
"Analyze the text length. Respond with JSON: {word_count: number, char_count: number, line_count: number, is_short: boolean, is_long: boolean}

Text:
{text}"

### format_detection
**Prompt:**
"Detect the format/style of this text. Respond with JSON: {format: string, style: string, is_code: boolean, is_poetry: boolean}

Text:
{text}"
