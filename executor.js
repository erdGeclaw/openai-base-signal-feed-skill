const BASE_SIGNAL_FEED_API_URL = "https://signals.ulol.li";
const BASE_SIGNAL_FEED_API_KEY = "YOUR_API_KEY_HERE"; // TODO: Replace with actual API key from gopass or environment

async function executeFunctionCall(functionCall) {
  const { name, arguments: args } = functionCall;
  let apiUrl = "";
  let headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${BASE_SIGNAL_FEED_API_KEY}`,
  };

  switch (name) {
    case "get_signals":
      apiUrl = `${BASE_SIGNAL_FEED_API_URL}/signals`;
      break;
    case "get_token_score":
      const tokenAddress = args.token_address;
      if (!tokenAddress) {
        throw new Error("Missing 'token_address' argument for get_token_score.");
      }
      apiUrl = `${BASE_SIGNAL_FEED_API_URL}/signals/score?token=${tokenAddress}`;
      break;
    case "get_new_pairs":
      apiUrl = `${BASE_SIGNAL_FEED_API_URL}/pairs/new`;
      break;
    case "check_health":
      apiUrl = `${BASE_SIGNAL_FEED_API_URL}/health`;
      break;
    default:
      throw new Error(`Unknown function: ${name}`);
  }

  try {
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error executing API call:", error.message);
    throw error;
  }
}

async function main() {
  // Read function call from stdin (simulated OpenAI tool call)
  const input = await new Promise(resolve => {
    let data = "";
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => resolve(data));
  });

  try {
    const functionCall = JSON.parse(input);
    const result = await executeFunctionCall(functionCall.function);

    // Output the result as JSON (simulated OpenAI function_call_output)
    process.stdout.write(JSON.stringify({
      tool_call_id: functionCall.id, // Assuming the input has an 'id' for the tool call
      output: result,
    }, null, 2));
  } catch (error) {
    // Output error in a structured way
    process.stderr.write(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }, null, 2));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
