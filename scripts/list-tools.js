#!/usr/bin/env node

// Quick test script to list tools from our MCP server
import { spawn } from 'child_process';

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  cwd: process.cwd()
});

// Send tools/list request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(request) + '\n');
server.stdin.end();

let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
});

server.on('close', (code) => {
  try {
    const response = JSON.parse(output.trim());
    if (response.result && response.result.tools) {
      console.log('✅ MCP Server Tools:');
      response.result.tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
      console.log(`\nTotal: ${response.result.tools.length} tools`);
    } else {
      console.log('❌ No tools found in response:', response);
    }
  } catch (e) {
    console.log('❌ Failed to parse response:', output);
  }
});