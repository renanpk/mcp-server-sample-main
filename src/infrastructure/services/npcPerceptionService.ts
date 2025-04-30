// src/application/services/npcPerceptionService.js
// Contém a lógica de mais alto nível para as *percepções* do NPC, usando o GameBridge.

import { IGameBridge } from "../gameBridge.js";

export class NpcPerceptionService {
    constructor(readonly gameBridge : IGameBridge) {
      if (!gameBridge) {
        throw new Error("NpcPerceptionService requires a GameBridge instance.");
      }
      this.gameBridge = gameBridge;
    }
  
    /**
     * Obtém os objetos visíveis para um NPC dentro de um certo alcance.
     * @param {object} args - Argumentos da ferramenta.
     * @param {string} args.npcId - O ID do NPC.
     * @param {number} [args.range=10] - O alcance da visão (opcional).
     * @returns {Promise<object>} - Lista de objetos visíveis.
     */
    async lookAround(args : any): Promise<any> {
      console.error(`[NpcPerceptionService] Processing lookAround for NPC ${args.npcId}`);
      if (!args.npcId) {
         return { success: false, message: "Missing npcId" };
      }
      const range = args.range || 10; // Valor padrão para o alcance
      return await this.gameBridge.queryVisibleObjects(args.npcId, range);
    }
  
    /**
     * Obtém o status atual de um NPC.
     * @param {object} args - Argumentos da ferramenta.
     * @param {string} args.npcId - O ID do NPC.
     * @returns {Promise<object>} - Status do NPC.
     */
    async getStatus(args: any) : Promise<any> {
      console.error(`[NpcPerceptionService] Processing getStatus for NPC ${args.npcId}`);
       if (!args.npcId) {
         return { success: false, message: "Missing npcId" };
      }
      return await this.gameBridge.queryNpcStatus(args.npcId);
    }
  
    // Adicionar mais métodos de percepção aqui (getCurrentGoal, listen, checkInventory, etc.)
  }