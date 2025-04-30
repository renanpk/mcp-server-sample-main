// main.js (revisado - Etapa 2)
import { createServerInstance } from './serverSetup.js';
import { serverConfig, transportConfig } from './config.js'; // Importa config para logging
import { registerApplicationCapabilities } from './capabilityRegistry.js';
import express from "express";
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const app = express();

/*
  case 'stdio':
      return new StdioServerTransport();
     case 'sse':
       return new SSEServerTransport("/messages", ); // Exemplo futuro
*/

async function main() {
  // 1. Criação do servidor e transporte
  const server = createServerInstance();
  registerApplicationCapabilities(server);
  let transport: SSEServerTransport | null = null;
    app.get("/sse", (req, res) => {
      console.log("SSE");
      transport = new SSEServerTransport("/messages", res);
      server.connect(transport);
    });
    app.post("/messages", (req, res) => {
      if (transport) {
        transport.handlePostMessage(req, res);
      }
    });    
    app.listen(3000);
  // 2. Registro das ferramentas/capacidades da aplicação
  //    Toda a lógica de instanciar serviços e registrar ferramentas
  //    está agora encapsulada nesta função.

  
 
  // 3. Conectando e iniciando o servidor
    // await server.connect(transport!);
    // console.error(`${serverConfig.name} v${serverConfig.version} MCP Server running on ${transportConfig.type}`);
 
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});