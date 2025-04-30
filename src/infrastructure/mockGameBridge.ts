import type {
    Position,
    ActionStatus,
    LookAroundResult,
    NpcStatus,
    VisibleObject,
  
} from '../types.js';
import { IGameBridge } from './gameBridge.js';

// Esta classe implementa a mesma interface que HttpGameBridge,
// mas não faz chamadas de rede. Ela apenas simula respostas.
export class MockGameBridge implements IGameBridge {

    constructor() {
        console.error(`[MockGameBridge] Initialized. Will return mock data.`);
    }

    // Simula a execução de um movimento
    async executeMove(npcId: string, targetPosition: Position): Promise<ActionStatus> {
        console.error(`[MockGameBridge] Received executeMove for ${npcId} to ${JSON.stringify(targetPosition)}.`);
        // Simula um pequeno atraso
        await new Promise(resolve => setTimeout(resolve, 50));
        // Retorna um sucesso mockado
        return { success: true, message: `Mock move initiated for ${npcId}.` };
        // Para testar falhas:
        // return { success: false, message: "Mock move failed: Path blocked (simulated)." };
    }

    // Simula uma interação
    async executeInteract(npcId: string, targetObjectId: string): Promise<ActionStatus> {
        console.error(`[MockGameBridge] Received executeInteract for ${npcId} with ${targetObjectId}.`);
        await new Promise(resolve => setTimeout(resolve, 50));
        // Simula sucesso ou falha baseado no ID do objeto, por exemplo
        if (targetObjectId === 'locked_chest') {
            return { success: false, message: "Mock interaction failed: Chest is locked." };
        }
        return { success: true, message: `Mock interaction successful: ${npcId} interacted with ${targetObjectId}.` };
    }

    // Simula a consulta de objetos visíveis
    async queryVisibleObjects(npcId: string, range: number): Promise<LookAroundResult> {
        console.error(`[MockGameBridge] Received queryVisibleObjects for ${npcId} with range ${range}.`);
        await new Promise(resolve => setTimeout(resolve, 50));
        // Retorna uma lista mockada de objetos
        const mockObjects: VisibleObject[] = [
            { id: "player_mock", type: "player", position: { x: 5, y: 5 } },
            { id: "mock_chest", type: "container", position: { x: 7, y: 8 }, attributes: { isLocked: false } },
            { id: "locked_chest", type: "container", position: { x: 10, y: 10 }, attributes: { isLocked: true } },
        ];
        // Filtra por range (simulação simples)
        const visibleInRange = mockObjects.filter(obj =>
            Math.sqrt(Math.pow(obj.position.x - 1, 2) + Math.pow(obj.position.y - 1, 2)) <= range // Assume NPC na posição (1,1) para o mock
        );
        return { objects: visibleInRange };
    }

    // Simula a consulta de status do NPC
    async queryNpcStatus(npcId: string): Promise<NpcStatus> {
        console.error(`[MockGameBridge] Received queryNpcStatus for ${npcId}.`);
        await new Promise(resolve => setTimeout(resolve, 50));
        // Retorna um status mockado
        const mockStatus: NpcStatus = {
            id: npcId,
            health: 90,
            maxHealth: 100,
            position: { x: 1, y: 1 }, // Posição fixa para o mock
            currentGoal: "Waiting for commands (mock)",
            inventory: [{ itemId: "mock_key", quantity: 1 }]
        };
        return mockStatus;
        // Para simular NPC não encontrado:
        // throw new Error(`Mock error: NPC ${npcId} not found.`);
    }
}