// src/capabilityRegistry.ts (ATUALIZADO PARA USAR MOCK CONDICIONALMENTE)

import { HttpGameBridge } from './infrastructure/httpGameBridge.js';
import { MockGameBridge } from './infrastructure/mockGameBridge.js'; // Importa o Mock
import type { IGameBridge } from './infrastructure/gameBridge.js';    // Importa a Interface


import { NpcActionController } from './interface/controllers/npcActionController.js';
import { NpcPerceptionController } from './interface/controllers/npcPerceptionController.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NpcActionService } from './infrastructure/services/npcActionService.js';
import { NpcPerceptionService } from './infrastructure/services/npcPerceptionService.js';
import { WeatherToolsController } from './interface/controllers/WeatherToolsController.js';
import { WeatherService } from './application/services/WeatherService.js';
import { NWSApiService } from './infrastructure/services/NWSApiService.js';

export function registerApplicationCapabilities(server: McpServer): void {

  // --- Decidir qual Bridge usar ---
  const useMock = process.env.USE_MOCK_BRIDGE === 'true';
  let gameBridge: IGameBridge; // Declara a variável com o tipo da Interface

  if (useMock) {
      console.warn("****************************************");
      console.warn("*** USING MOCK GAME BRIDGE FOR TESTS ***");
      console.warn("****************************************");
      gameBridge = new MockGameBridge(); // Instancia o Mock
  } else {
      // Instancia o HttpGameBridge real (como antes)
      const gameApiBaseUrl = process.env.GAME_API_URL || "http://localhost:8080/api";
      console.error(`[CapabilityRegistry] Using HTTP Game Bridge targeting: ${gameApiBaseUrl}`);
      gameBridge = new HttpGameBridge({ baseUrl: gameApiBaseUrl });
  }

    // Inicializando serviços e controladores
    const nwsApiService = new NWSApiService();
    const weatherService = new WeatherService(nwsApiService);  
    new WeatherToolsController(server, weatherService);
  // --- O restante do código não muda, pois ambos os Bridges usam a mesma interface ---
  const npcActionService = new NpcActionService(gameBridge); // Recebe qualquer IGameBridge
  const npcPerceptionService = new NpcPerceptionService(gameBridge); // Recebe qualquer IGameBridge
  new NpcActionController(server, npcActionService);
  new NpcPerceptionController(server, npcPerceptionService);

  console.error(`[CapabilityRegistry] NPC application capabilities registered. Mode: ${useMock ? 'MOCK' : 'HTTP'}`);
}