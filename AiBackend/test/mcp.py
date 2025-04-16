import os
from flask import Flask, request, jsonify
from mcp.server.fastmcp import FastMCP
from groq import Client as GroqClient

# Initialize Flask app
app = Flask(__name__)

# Initialize Groq client
groq_api_key = "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"
if not groq_api_key:
    raise EnvironmentError("GROQ_API_KEY environment variable not set.")
groq_client = GroqClient(api_key=groq_api_key)

# Initialize MCP server
server = FastMCP("Groq MCP Server")

# Define a tool that queries Groq's LLM
@server.tool("ask_groq")
def ask_groq(prompt: str) -> str:
    try:
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error querying Groq: {str(e)}"

# Flask route to test the MCP tool
@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt is required.'}), 400
    response = ask_groq(prompt)
    return jsonify({'response': response})

if __name__ == "__main__":
    # Run both MCP server and Flask app
    from threading import Thread

    # Start MCP server in a separate thread
    def run_mcp():
        server.run()

    mcp_thread = Thread(target=run_mcp)
    mcp_thread.start()

    # Start Flask app
    app.run(port=5000)
