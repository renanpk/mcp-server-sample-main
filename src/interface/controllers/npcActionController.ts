import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod"; // Importar Zod
import type { Position, ActionStatus } from "../../types.js"; // Importar tipos necessários
import { NpcActionService } from "../../infrastructure/services/npcActionService.js";

export class NpcActionController {
    constructor(
      private readonly server: McpServer,
      private readonly actionService: NpcActionService
    ) {
      this.registerTools();
    }
  
    private registerTools(): void {
      this.registerNpcMoveToTool();
      this.registerNpcInteractWithTool();
      // Adicionar chamadas para outros registros de ferramentas de ação aqui
    }
  
    private registerNpcMoveToTool(): void {    
      this.server.tool(
        // ID da ferramenta (kebab-case é comum)
        "npc-move-to",
        // Descrição para o LLM
        "Commands a specific NPC to move to a target position {x, y, z}.",
        // Schema Zod para os parâmetros
        {
          npcId: z.string().describe("The unique identifier of the NPC to command."),
          targetPosition: z.object({
            x: z.number().describe("Target X coordinate."),
            y: z.number().describe("Target Y coordinate."),
            z: z.number().optional().describe("Optional target Z coordinate."),
          }).describe("The target coordinates object {x, y, z?}."),
        },
        // Handler assíncrono, recebe parâmetros validados e destructurados
        async ({ npcId, targetPosition }) => {
          console.error(`[NpcActionController] Tool 'npc-move-to' called for ${npcId}`);
          const result: ActionStatus = await this.actionService.moveTo({ npcId, targetPosition });
  
          // Adaptar o retorno para o formato { content: [...] }
          // Se o resultado for simples sucesso/falha, podemos usar 'text'
          // Se for mais complexo, talvez 'json'
          return {
            content: [
              {
                type: "text", // ou 'json' se preferir retornar o objeto ActionStatus completo
                text: result.message || (result.success ? "Move command successful." : "Move command failed."),
                // data: result // Alternativa se usar type: 'json'
              },
            ],
          };
        }
      );
      console.error("[NpcActionController] Registered tool: npc-move-to");
    }
  
    private registerNpcInteractWithTool(): void {
      this.server.tool(
        "npc-interact-with",
        "Commands a specific NPC to interact with a target object or entity.",
        {
          npcId: z.string().describe("The unique identifier of the NPC."),
          targetObjectId: z.string().describe("The unique identifier of the object/entity to interact with."),
        },
        async ({ npcId, targetObjectId }) => {
           console.error(`[NpcActionController] Tool 'npc-interact-with' called for ${npcId}`);
          const result: ActionStatus = await this.actionService.interactWith({ npcId, targetObjectId });
  
          return {
            content: [
              {
                type: "text",
                text: result.message || (result.success ? "Interaction successful." : "Interaction failed."),
                // data: result // Alternativa se usar type: 'json'
              },
            ],
          };
        }
      );
       console.error("[NpcActionController] Registered tool: npc-interact-with");
    }
  }