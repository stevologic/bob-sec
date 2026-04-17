#!/usr/bin/env python3
"""
Ollama Rule Evaluator POC

A proof-of-concept tool that evaluates text against rules defined in a Markdown
configuration file, using an offline Ollama model for AI analysis.

Usage:
    python3 ollama_evaluator.py --config config.md --input input.txt
    echo "text" | python3 ollama_evaluator.py --config config.md
    python3 ollama_evaluator.py --config config.md  # Interactive mode
"""

import argparse
import json
import sys
import re
import requests

# Default Ollama configuration
DEFAULT_OLLAMA_IP = "127.0.0.1"
DEFAULT_OLLAMA_PORT = 11434
DEFAULT_OLLAMA_MODEL = "llama3.2:1b"


def render_markdown(text: str) -> str:
    """Simple markdown renderer without external library."""
    if not text:
        return ""
    
    result = []
    lines = text.split('\n')
    
    for line in lines:
        # Header
        if line.startswith('### '):
            result.append(f"<h3>{line[4:]}</h3>")
        elif line.startswith('## '):
            result.append(f"<h2>{line[3:]}</h2>")
        elif line.startswith('# '):
            result.append(f"<h1>{line[1:]}</h1>")
        # Bold
        elif '**' in line:
            line = line.replace('**', '<strong>', 1).replace('**', '</strong>', 1)
            result.append(line)
        # Code
        elif '`' in line:
            result.append(line.replace('`', '<code>', 1).replace('`', '</code>', 1))
        # Line break
        elif line.strip() == '':
            result.append('<br>')
        else:
            result.append(f"<p>{line}</p>")
    
    return '\n'.join(result)


def load_config(config_path: str) -> dict:
    """
    Load and parse the Markdown configuration file.
    
    Expected structure:
    - Ollama Settings section with ip_address, port, model
    - Rules section with named rules containing prompts
    """
    if not config_path or config_path == "-":
        # Read from stdin
        config_content = sys.stdin.read()
    else:
        with open(config_path, 'r', encoding='utf-8') as f:
            config_content = f.read()
    
    config = {
        'ollama': {
            'ip_address': DEFAULT_OLLAMA_IP,
            'port': DEFAULT_OLLAMA_PORT,
            'model': DEFAULT_OLLAMA_MODEL
        },
        'rules': {}
    }
    
    # Extract Ollama settings
    ollama_section = re.search(
        r'^##\s*Ollama\s+Settings\s*\n(.*?)(?=##|$)',
        config_content,
        re.DOTALL | re.IGNORECASE | re.MULTILINE
    )
    
    if ollama_section:
        section_text = ollama_section.group(1)
        # Extract ip_address
        ip_match = re.search(r'ip_address:\s*(\S+)', section_text, re.IGNORECASE)
        if ip_match:
            config['ollama']['ip_address'] = ip_match.group(1).strip()
        # Extract port
        port_match = re.search(r'port:\s*(\d+)', section_text, re.IGNORECASE)
        if port_match:
            config['ollama']['port'] = int(port_match.group(1))
        # Extract model
        model_match = re.search(r'model:\s*(\S+)', section_text, re.IGNORECASE)
        if model_match:
            config['ollama']['model'] = model_match.group(1).strip()
    
    # Extract rules
    rules_section = re.search(
        r'^##\s*Rules\s*\n(.*?)(?=##|$)',
        config_content,
        re.DOTALL | re.IGNORECASE | re.MULTILINE
    )
    
    if rules_section:
        section_text = rules_section.group(1)
        # Find each rule (named rule with prompt)
        rule_pattern = r'^###\s*(\S+)\s*\n.*?Prompt:\s*(.*?)$', re.DOTALL | re.MULTILINE | re.IGNORECASE
        
        for match in re.finditer(rule_pattern, section_text, re.DOTALL | re.MULTILINE | re.IGNORECASE):
            rule_name = match.group(1).strip()
            prompt = match.group(2).strip()
            
            # Clean up the prompt - remove "Text:" prefix and placeholder
            prompt = re.sub(r'^Text:\s*\n{text}', '{text}', prompt)
            
            config['rules'][rule_name] = {
                'prompt': prompt,
                'description': prompt[:100] + "..." if len(prompt) > 100 else prompt
            }
    
    return config


def format_text_with_rules(rule_name: str, text: str, config: dict) -> str:
    """
    Format the input text for use in the rule's prompt.
    Replaces {text} placeholder with actual text.
    """
    rule = config['rules'].get(rule_name, {})
    prompt = rule.get('prompt', '')
    
    # Replace {text} placeholder if present
    if '{text}' in prompt:
        formatted = prompt.replace('{text}', text.strip())
    else:
        formatted = prompt
    
    # Use simple markdown rendering
    rendered_prompt = render_markdown(formatted)
    
    return rendered_prompt


def send_to_ollama(rule_name: str, text: str, config: dict, max_tokens: int = 2000) -> dict:
    """
    Send the formatted text to Ollama and get the response.
    
    Args:
        rule_name: Name of the rule to execute
        text: Input text to analyze
        config: Configuration dictionary
        max_tokens: Maximum tokens for the response
    
    Returns:
        Dictionary with the Ollama response
    """
    ollama_config = config['ollama']
    url = f"http://{ollama_config['ip_address']}:{ollama_config['port']}/api/generate"
    
    payload = {
        'model': ollama_config['model'],
        'prompt': format_text_with_rules(rule_name, text, config),
        'stream': False,
        'options': {
            'temperature': 0.7,
            'top_p': 0.9,
            'num_predict': max_tokens
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=120)
        
        if response.status_code == 200:
            return {
                'success': True,
                'rule': rule_name,
                'response': response.json().get('response', ''),
                'error': None
            }
        else:
            return {
                'success': False,
                'rule': rule_name,
                'response': '',
                'error': f"Ollama API error: {response.status_code} - {response.text}"
            }
    except requests.exceptions.ConnectionError as e:
        return {
            'success': False,
            'rule': rule_name,
            'response': '',
            'error': f"Connection error: {str(e)}"
        }
    except requests.exceptions.Timeout as e:
        return {
            'success': False,
            'rule': rule_name,
            'response': '',
            'error': f"Request timeout: {str(e)}"
        }
    except Exception as e:
        return {
            'success': False,
            'rule_name': rule_name,
            'response': '',
            'error': f"Error: {str(e)}"
        }


def interactive_mode(config: dict):
    """
    Run in interactive mode - read from stdin until EOF.
    """
    print(f"\n🤖 Ollama Rule Evaluator - Interactive Mode")
    print(f"Ollama: {config['ollama']['ip_address']}:{config['ollama']['port']}")
    print(f"Model: {config['ollama']['model']}")
    print(f"Rules available: {', '.join(config['rules'].keys())}")
    print("Enter text to analyze, or 'exit' to quit, 'help' for options.\n")
    
    while True:
        try:
            print("-" * 60)
            text = input("Input text> ").strip()
            
            if text.lower() in ('exit', 'quit', 'q'):
                print("\nExiting...")
                break
            
            if text.lower() == 'help':
                print("\nAvailable commands:")
                print("  <text>           - Analyze the entered text")
                print("  <rule_name>      - Run the specified rule")
                print("  help              - Show this help")
                print("  exit              - Exit the program")
                print("  clear             - Clear screen")
                continue
            
            if text.lower() == 'clear':
                print("\n" * 2)
                continue
            
            # Determine if user entered a rule name or text
            rule_names = list(config['rules'].keys())
            
            # Check if input matches a rule name
            found_rule = None
            for rule in rule_names:
                if text.lower() == rule.lower():
                    found_rule = rule
                    break
            
            if found_rule:
                print(f"\n🔍 Running rule: {found_rule}\n")
                result = send_to_ollama(found_rule, text, config)
                display_result(result)
            else:
                # Use default rule or first rule if none specified
                if rule_names:
                    default_rule = rule_names[0]
                    print(f"\n🔍 Running default rule: {default_rule}\n")
                    result = send_to_ollama(default_rule, text, config)
                    display_result(result)
                else:
                    print("\n⚠️ No rules defined in config. Add rules to the config file.\n")
                    
        except EOFError:
            print("\nEOF received. Exiting...")
            break
        except KeyboardInterrupt:
            print("\nInterrupted. Exiting...")
            break


def process_file(config: dict, input_file: str, rules: list = None):
    """
    Process input from a file.
    
    Args:
        config: Configuration dictionary
        input_file: Path to input file
        rules: List of rule names to apply (optional)
    """
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            text = f.read()
        print(f"\n✅ Read {len(text)} bytes from {input_file}\n")
    except FileNotFoundError:
        print(f"❌ Error: File not found - {input_file}")
        return
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return
    
    if rules:
        rule_names = rules
    else:
        # Default: run all rules
        rule_names = list(config['rules'].keys())
    
    if not rule_names:
        print("⚠️ No rules defined in config.")
        return
    
    print(f"\n📋 Applying {len(rule_names)} rules:\n")
    print("=" * 80)
    
    for rule_name in rule_names:
        print(f"\n### Rule: {rule_name}")
        print("-" * 40)
        result = send_to_ollama(rule_name, text, config)
        display_result(result)
    
    print("\n" + "=" * 80)


def process_stdin(config: dict, rules: list = None):
    """
    Process input from stdin.
    """
    text = sys.stdin.read()
    if not text.strip():
        print("⚠️ No input received from stdin.")
        return
    
    print(f"\n✅ Read {len(text)} bytes from stdin\n")
    
    if rules:
        rule_names = rules
    else:
        rule_names = list(config['rules'].keys())
    
    if not rule_names:
        print("⚠️ No rules defined in config.")
        return
    
    print(f"\n📋 Applying {len(rule_names)} rules:\n")
    print("=" * 80)
    
    for rule_name in rule_names:
        print(f"\n### Rule: {rule_name}")
        print("-" * 40)
        result = send_to_ollama(rule_name, text, config)
        display_result(result)
    
    print("\n" + "=" * 80)


def display_result(result: dict):
    """
    Display the result in a formatted way.
    """
    if result['success']:
        print(f"\n✅ Response:\n")
        print(result['response'])
    else:
        print(f"\n❌ Error: {result.get('error', 'Unknown error')}")


def main():
    """
    Main entry point.
    """
    parser = argparse.ArgumentParser(
        description='Ollama Rule Evaluator POC - Evaluate text against AI rules',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process from file
  python3 ollama_evaluator.py --config config.md --input text.txt
  
  # Process from stdin
  echo "Hello world" | python3 ollama_evaluator.py --config config.md
  
  # Interactive mode
  python3 ollama_evaluator.py --config config.md
  
  # Run specific rules
  python3 ollama_evaluator.py --config config.md --input text.txt --rules rule1,rule2
        """
    )
    
    parser.add_argument(
        '-c', '--config',
        default='config.md',
        help='Path to Markdown configuration file (default: config.md)'
    )
    
    parser.add_argument(
        '-i', '--input',
        default=None,
        help='Input file path (default: stdin)'
    )
    
    parser.add_argument(
        '-r', '--rules',
        default=None,
        help='Comma-separated list of rule names to apply (default: all rules)'
    )
    
    parser.add_argument(
        '--interactive',
        action='store_true',
        help='Run in interactive mode (reads from stdin until EOF)'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Verbose output'
    )
    
    args = parser.parse_args()
    
    # Load configuration
    try:
        config = load_config(args.config)
    except FileNotFoundError:
        print(f"❌ Error: Configuration file not found - {args.config}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        sys.exit(1)
    
    # Display Ollama connection info
    print(f"\n🔗 Ollama Connection Info:")
    print(f"   IP: {config['ollama']['ip_address']}")
    print(f"   Port: {config['ollama']['port']}")
    print(f"   Model: {config['ollama']['model']}")
    print(f"   Rules: {', '.join(config['rules'].keys()) if config['rules'] else 'None'}")
    print()
    
    # Determine processing mode
    if args.interactive:
        interactive_mode(config)
    elif args.input:
        process_file(config, args.input, args.rules.split(',') if args.rules else None)
    else:
        # Default: read from stdin
        process_stdin(config, args.rules.split(',') if args.rules else None)


if __name__ == '__main__':
    main()
