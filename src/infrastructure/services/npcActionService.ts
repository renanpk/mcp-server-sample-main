// src/application/services/npcActionService.js
// Contém a lógica de mais alto nível para as *ações* do NPC, usando o GameBridge.

import { IGameBridge } from "../gameBridge.js";

export class NpcActionService {
    constructor(readonly gameBridge : IGameBridge) {
      if (!gameBridge) {
        throw new Error("NpcActionService requires a GameBridge instance.");
      }
      this.gameBridge = gameBridge;
    }
  
    /**
     * Comanda um NPC para se mover para uma posição.
     * @param {object} args - Argumentos da ferramenta.
     * @param {string} args.npcId - O ID do NPC a mover.
     * @param {object} args.targetPosition - O objeto de posição {x, y, z?}.
     * @returns {Promise<object>} - Resultado da ação.
     */
    async moveTo(args : any) {
      console.error(`[NpcActionService] Processing moveTo for NPC ${args.npcId}`);
      // Aqui poderíamos adicionar validações ou lógica adicional antes de chamar a ponte
      if (!args.npcId || !args.targetPosition) {
         return { success: false, message: "Missing npcId or targetPosition" };
      }
      return await this.gameBridge.executeMove(args.npcId, args.targetPosition);
    }
  
    /**
     * Comanda um NPC para interagir com um objeto.
     * @param {object} args - Argumentos da ferramenta.
     * @param {string} args.npcId - O ID do NPC.
     * @param {string} args.targetObjectId - O ID do objeto alvo.
     * @returns {Promise<object>} - Resultado da ação.
     */
    async interactWith(args : any) {
      console.error(`[NpcActionService] Processing interactWith for NPC ${args.npcId} and target ${args.targetObjectId}`);
      if (!args.npcId || !args.targetObjectId) {
         return { success: false, message: "Missing npcId or targetObjectId" };
      }
      // Validações adicionais podem ir aqui (ex: o objeto está ao alcance?)
      return await this.gameBridge.executeInteract(args.npcId, args.targetObjectId);
    }
  
    // Adicionar mais métodos de ação aqui (speak, attack, useItem, etc.)
  }