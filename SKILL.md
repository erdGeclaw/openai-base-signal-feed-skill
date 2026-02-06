---
name: openai-base-signal-feed
version: 0.1.0
description: Integrates the Base Signal Feed API as functions for OpenAI models.
metadata:
  {
    "openclaw":
      {
        "emoji": "🤖",
        "category": "trading",
      },
  }
---

# OpenAI Base Signal Feed Skill

This skill allows OpenAI models to interact with the Base Signal Feed API using OpenAI's Function Calling mechanism. The agent acts as an intermediary, receiving function call requests from the OpenAI model, executing the corresponding Base Signal Feed API call, and returning the results to the model.

## Functions Provided

The following functions are exposed to OpenAI models:

-   `get_signals()`: Retrieves the latest smart money signals from the Base Signal Feed.
-   `get_token_score(token_address: string)`: Retrieves the smart money score for a given token from the Base Signal Feed.
-   `get_new_pairs()`: Retrieves recently detected new trading pairs on Base L2 from the Base Signal Feed.
-   `check_health()`: Checks the health status of the Base Signal Feed API.

## Usage

To use this skill, you would typically:

1.  **Load the function definitions:** Provide the contents of `openai_base_signal_feed.json` to your OpenAI model as part of its `tools` parameter in a chat completion request.
2.  **Handle function calls:** When the OpenAI model decides to call one of these functions, it will return a message containing `function_call` details (name and arguments).
3.  **Execute the function:** This agent will intercept such `function_call` requests. For example, if the model calls `get_signals()`, this agent will make a `web_fetch` request to `https://signals.ulol.li/signals` and return the JSON response.
4.  **Return results to the model:** The agent will then format the API response into a `function_call_output` and send it back to the OpenAI model for further processing.

## Implementation Details

The core logic for executing the Base Signal Feed API calls will be handled by the OpenClaw agent itself, intercepting function calls from the OpenAI model based on the provided JSON schema.

**Base Signal Feed API Endpoint:** `https://signals.ulol.li`

This skill acts as a proxy, translating OpenAI function calls into HTTP requests to the Base Signal Feed and back.

## API Key Management

The Base Signal Feed API requires an API key for access. This skill assumes the API key is managed securely by the OpenClaw agent and is used in the `Authorization` header for API requests.


## Setup (Conceptual)

To enable this for an OpenAI model, you would pass the contents of `openai_base_signal_feed.json` as the `tools` parameter in your OpenAI API calls. The OpenClaw agent, if configured to handle these function calls, would then automatically execute them.

**(Note: Actual integration with a specific OpenAI model environment might require additional configuration beyond this skill definition, depending on the OpenAI client library or platform being used.)**

## Detailed Usage Examples

Here are examples demonstrating the interaction flow with an OpenAI model using the Base Signal Feed skill.

### 1. Providing Function Definitions to OpenAI

First, load the function definitions from `openai_base_signal_feed.json` and include them in your OpenAI chat completion request.

\`\`\`python
from openai import OpenAI
import json

client = OpenAI()

# Load function definitions (assuming openai_base_signal_feed.json is available)
with open('openai_base_signal_feed.json', 'r') as f:
    tools_definitions = json.load(f)

messages = [{"role": "user", "content": "What is the smart money score for token 0x123...abc?"}]

response = client.chat.completions.create(
    model="gpt-4o", # Or another function-calling capable model
    messages=messages,
    tools=tools_definitions,
    tool_choice="auto", # Allows the model to decide whether to call a tool
)

response_message = response.choices[0].message
tool_calls = response_message.tool_calls

if tool_calls:
    print("Model requested a tool call:")
    for tool_call in tool_calls:
        print(f"  Function Name: {tool_call.function.name}")
        print(f"  Arguments: {tool_call.function.arguments}")
        # At this point, your application (OpenClaw agent) would execute the tool
else:
    print("Model responded with text:")
    print(response_message.content)
\`\`\`

### 2. Example Model Function Call Response

If the user asks "What is the smart money score for token 0x123...abc?", the OpenAI model might respond with a `tool_calls` object similar to this:

\`\`\`json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_12345xyz",
      "type": "function",
      "function": {
        "name": "get_token_score",
        "arguments": "{\\"token_address\\": \\"0x123...abc\\"}"
      }
    }
  ]
}
\`\`\`

### 3. Agent Execution (Conceptual)

Upon receiving the above `tool_calls` from the model, your OpenClaw agent, utilizing the `executor.js` script, would:

-   Identify the function `get_token_score`.
-   Extract `token_address` as `"0x123...abc"`.
-   Construct and execute an HTTP GET request to `https://signals.ulol.li/signals/score?token=0x123...abc`.
-   Receive a JSON response from the Base Signal Feed API.

### 4. Returning Tool Output to the Model

After the agent executes the tool and gets a result (e.g., `{"score": 85, "details": "..."}`), it sends this output back to the OpenAI model to continue the conversation.

\`\`\`python
# Assuming 'tool_output_from_agent' is the JSON response from the Base Signal Feed API
tool_output_from_agent = {"score": 85, "details": "Some details about the token."}
tool_call_id = "call_12345xyz" # The ID from the original tool call

messages.append(response_message) # Add assistant's tool call message
messages.append(
    {
        "tool_call_id": tool_call_id,
        "role": "tool",
        "name": "get_token_score",
        "content": json.dumps(tool_output_from_agent)
    }
)

second_response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
)

print("Model's final response:")
print(second_response.choices[0].message.content)
\`\`\`

This detailed flow illustrates how the Base Signal Feed skill, combined with your OpenClaw agent's execution logic, provides powerful extension capabilities to OpenAI models.
