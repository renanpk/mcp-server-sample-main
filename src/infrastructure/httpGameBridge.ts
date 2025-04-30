import fetch from 'node-fetch'; // Precisa instalar: npm install node-fetch
import type {
    Position,
    ActionStatus, // Usaremos isso como tipo base para MoveResult e InteractResult
    LookAroundResult,
    NpcStatus,
    VisibleObject // Importando para usar no erro de lookAround
} from '../types.js';
import type { IGameBridge } from './gameBridge.js'; // Importa a interface que definimos antes

// Definindo uma interface para a configuração
interface HttpGameBridgeConfig {
    baseUrl: string; // Ex: "http://localhost:8080/api"
    timeoutMs?: number; // Tempo limite opcional para as requisições
}

// Uma classe de erro personalizada para erros da API do jogo
class GameApiError extends Error {
    constructor(message: string, public status?: number, public details?: any) {
        super(message);
        this.name = 'GameApiError';
    }
}

export class HttpGameBridge implements IGameBridge {
    private readonly baseUrl: string;
    private readonly timeoutMs: number;

    constructor(config: HttpGameBridgeConfig) {
        // Remove barra final se existir para consistência
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.timeoutMs = config.timeoutMs || 5000; // Padrão de 5 segundos
        console.error(`[HttpGameBridge] Initialized. Targeting Game API at: ${this.baseUrl}`);
    }

    // Método helper privado para fazer as chamadas API
    private async _request<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: Record<string, any>
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        console.error(`[HttpGameBridge] Requesting: ${method} ${url}`, body ? `with body: ${JSON.stringify(body)}` : '');
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal, // Para o timeout
            });
            clearTimeout(timeoutId); // Limpa o timeout se a resposta chegou
            // Tenta obter a resposta como texto mesmo em caso de erro para log
            let responseBodyText: string | null = null;
            try {
                 responseBodyText = await response.text();
            } catch (e) { /* Ignora se não conseguir ler o corpo */ }

            if (!response.ok) {
                console.error(`[HttpGameBridge] API Error: ${response.status} ${response.statusText} on ${method} ${url}. Body: ${responseBodyText ?? '[empty]'}`);
                let errorDetails: any = null;
                 try {
                    if (responseBodyText) errorDetails = JSON.parse(responseBodyText);
                 } catch (e) { /* Ignora se não for JSON válido */ }
                throw new GameApiError(
                    `Game API request failed with status ${response.status}`,
                    response.status,
                    errorDetails || { rawResponse: responseBodyText }
                );
            }

            if (!responseBodyText) {
                // Caso de sucesso sem corpo (ex: 204 No Content, ou se response.text() falhou antes)
                // Para GET ou se esperamos JSON, isso geralmente é um problema.
                 console.warn(`[HttpGameBridge] Warning: Successful response (${response.status}) but empty body for ${method} ${url}`);
                 // Retornar um objeto vazio ou lançar erro, dependendo da sua necessidade
                 // Para simplificar, vamos assumir que respostas de sucesso sempre terão corpo JSON se esperado.
                 // Se a API retornar 204, precisamos tratar isso nos métodos específicos.
                 if (method === 'GET') throw new GameApiError("Successful GET request returned empty body", response.status);
                 return {} as T; // Retorna objeto vazio para POST/PUT/DELETE sem corpo
            }

            try {
                const data: T = JSON.parse(responseBodyText);
                console.error(`[HttpGameBridge] Response OK from ${method} ${url}:`, data);
                return data;
            } catch (error) {
                 console.error(`[HttpGameBridge] Failed to parse JSON response from ${method} ${url}. Body: ${responseBodyText}`, error);
                 throw new GameApiError("Failed to parse JSON response from game API", response.status, { rawResponse: responseBodyText });
            }

        } catch (error: any) {
            clearTimeout(timeoutId); // Garante limpeza do timeout em caso de erro
            if (error.name === 'AbortError') {
                 console.error(`[HttpGameBridge] Request timed out (${this.timeoutMs}ms): ${method} ${url}`);
                 throw new GameApiError(`Request timed out to ${url}`, undefined, { type: 'Timeout' });
            }
            if (error instanceof GameApiError) {
                // Re-lança o erro já tratado
                throw error;
            }
            // Outros erros (rede, DNS, etc.)
            console.error(`[HttpGameBridge] Network or fetch error for ${method} ${url}:`, error);
            throw new GameApiError(error.message || 'Network error during game API request', undefined, { cause: error });
        }
    }

    // --- Implementação dos Métodos da Interface IGameBridge ---

    async executeMove(npcId: string, targetPosition: Position): Promise<ActionStatus> {
        const endpoint = `/npc/${npcId}/actions/move`;
        try {
            // A API hipotética retorna um objeto { success: boolean, message: string } que bate com ActionStatus
            const result = await this._request<ActionStatus>(endpoint, 'POST', { targetPosition });
            return result; // Retorna diretamente
        } catch (error: any) {
            // Retorna um ActionStatus de falha padronizado
            return { success: false, message: error.message || `Failed to execute move for ${npcId}` };
        }
    }

    async executeInteract(npcId: string, targetObjectId: string): Promise<ActionStatus> {
        const endpoint = `/npc/${npcId}/actions/interact`;
        try {
            const result = await this._request<ActionStatus>(endpoint, 'POST', { targetObjectId });
            return result;
        } catch (error: any) {
            return { success: false, message: error.message || `Failed to execute interact for ${npcId}` };
        }
    }

    async queryVisibleObjects(npcId: string, range: number): Promise<LookAroundResult> {
        const endpoint = `/npc/${npcId}/perception/visible_objects?range=${encodeURIComponent(range)}`;
        try {
            // A API hipotética retorna { objects: VisibleObject[] } que bate com LookAroundResult
            const result = await this._request<LookAroundResult>(endpoint, 'GET');
            return result;
        } catch (error: any) {
            console.error(`[HttpGameBridge] Error in queryVisibleObjects for ${npcId}:`, error);
            // Retorna um resultado vazio em caso de erro para não quebrar o fluxo do LLM? Ou relança?
            // Por ora, retornaremos vazio. Poderia ser configurável.
            return { objects: [] };
            // Alternativa: re-lançar o erro: throw error;
        }
    }

    async queryNpcStatus(npcId: string): Promise<NpcStatus> {
        const endpoint = `/npc/${npcId}/status`;
        try {
            // A API hipotética retorna o objeto NpcStatus diretamente
            const result = await this._request<NpcStatus>(endpoint, 'GET');
            return result;
        } catch (error: any) {
            console.error(`[HttpGameBridge] Error in queryNpcStatus for ${npcId}:`, error);
            // Lançar um erro aqui parece mais apropriado, pois o status é fundamental
            // O chamador (NpcPerceptionService) precisará tratar isso.
            throw new Error(`Could not retrieve status for NPC ${npcId}: ${error.message}`);
            // Alternativa: retornar um status padrão/nulo? Depende da lógica do agente.
            // return { id: npcId, health: 0, position: {x:0, y:0}, currentGoal: 'UNKNOWN_STATUS' };
        }
    }
}