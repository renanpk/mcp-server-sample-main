// serverSetup.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// Importar outros transportes se necessário no futuro
import { serverConfig, transportConfig } from './config.js';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";


export function createServerInstance() {  
  const server = new McpServer({
    name: serverConfig.name,
    version: serverConfig.version     
  });  
  return server;
}

