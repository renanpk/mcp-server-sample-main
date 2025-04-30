// src/types.ts

export interface Position {
    x: number;
    y: number;
    z?: number; // Coordenada Z opcional
  }
  
  export interface ActionStatus {
    success: boolean;
    message?: string; // Mensagem opcional de status ou erro
    details?: any;    // Detalhes adicionais, se necessário
  }
  
  export interface MoveResult extends ActionStatus {} // Alias para clareza
  
  export interface InteractResult extends ActionStatus {} // Alias para clareza
  
  export interface VisibleObject {
    id: string;
    type: string; // Ex: 'player', 'container', 'enemy', 'static_mesh'
    position: Position;
    attributes?: Record<string, any>; // Propriedades adicionais (ex: 'isLocked', 'health')
  }
  
  export interface NpcStatus {
    id: string;
    health: number;
    maxHealth?: number;
    position: Position;
    currentGoal?: string; // Objetivo textual ou ID de uma tarefa
    inventory?: { itemId: string; quantity: number }[]; // Exemplo de inventário
    // Outros status relevantes...
  }
  
  export interface LookAroundResult {
      objects: VisibleObject[];
  }
  
  // Interface para os argumentos esperados pela ferramenta moveTo no controller
  // Útil para type safety no handler
  export interface MoveToArgs {
      npcId: string;
      targetPosition: Position;
  }
  
  export interface InteractWithArgs {
      npcId: string;
      targetObjectId: string;
  }
  
  export interface LookAroundArgs {
      npcId: string;
      range?: number;
  }
  
  export interface GetStatusArgs {
      npcId: string;
  }