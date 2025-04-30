import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod"; // Importar Zod
import type { LookAroundResult, NpcStatus } from "../../types.js"; // Importar tipos de resultado
import { NpcPerceptionService } from "../../infrastructure/services/npcPerceptionService.js";

export class NpcPerceptionController {
    constructor(
      private readonly server: McpServer,
      private readonly perceptionService: NpcPerceptionService
    ) {
      this.registerTools();
    }
  
    private registerTools(): void {
      this.registerNpcLookAroundTool();
      this.registerNpcGetStatusTool();
      // Adicionar chamadas para outros registros de ferramentas de percepção aqui
    }
  
    private registerNpcLookAroundTool(): void {
     
      this.server.tool(
        "npc-look-around",
        "Gets a list of objects and entities visible to a specific NPC within a certain range.",
       {
          npcId: z.string().describe("The unique identifier of the NPC."),
          range: z.number().optional().default(10).describe("Optional vision range in game units. Defaults to 10."),
        },
        // Handler que retorna dados estruturados
        async ({ npcId, range }) => {
          console.error(`[NpcPerceptionController] Tool 'npc-look-around' called for ${npcId}`);
              const result: LookAroundResult = await this.perceptionService.lookAround({ npcId, range });
              // Para dados estruturados, usar type: 'json' parece mais adequado
              return {
                content: [
                  {
                    type: "resource", // Usando o tipo resource
                    resource: {
                      text: "NPC Look Around Result", // Uma descrição ou título do recurso
                      uri: JSON.stringify(result),  // Transformando o resultado em uma string JSON
                      mimeType: "application/json", // Tipo MIME indicando que é JSON
                    }
                  }
                ]
              };
         
        }
      );
       console.error("[NpcPerceptionController] Registered tool: npc-look-around");
    }
  
    private registerNpcGetStatusTool(): void {
      this.server.tool(
        "npc-get-status",
        "Gets the current status of a specific NPC (health, position, current goal, etc.).",
        {
          npcId: z.string().describe("The unique identifier of the NPC."),
        },       
        async ({ npcId } ) => {
           console.error(`[NpcPerceptionController] Tool 'npc-get-status' called for ${npcId}`);
          
              const result: NpcStatus = await this.perceptionService.getStatus({ npcId });
              // Também usar type: 'json' para o status
              return {
                content: [
                  {
                    type: "resource", // Mudamos de "json" para "resource"
                    resource: {
                      text: "NPC Status Result", // Descrição do recurso
                      uri: JSON.stringify(result), // Serializa o resultado como uma string JSON
                      mimeType: "application/json", // Indica que o tipo é JSON
                    }
                  }
                ]
              };
        
        }
      );
       console.error("[NpcPerceptionController] Registered tool: npc-get-status");
    }
  }