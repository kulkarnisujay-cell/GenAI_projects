export interface Asset {
  id: string;
  name: string;
  description: string;
  type: 'stage' | 'workflow';
  isNew?: boolean;
  category: string;
  owner: string;
  tag?: 'Prod' | 'Non-prod';
  tagColor?: 'pink' | 'cyan';
  avatar?: string; // Could be a URL or an identifier for a character/letter
  pinned?: boolean;
}

export interface ChatMessage {
  id:string;
  sender: 'user' | 'agent';
  text: string;
  isGenerating?: boolean;
}

export interface AgentAction {
  type: 'highlight_asset';
  assetName: string;
}

// Types for the new Workflow Wizard
export type WorkflowFleet = 'NON_PROD' | 'PROD' | 'TESTING';

export interface WorkflowConfig {
  workflowType: string;
  fleet: WorkflowFleet;
  directory: string;
  description: string;
}

export interface WizardStage {
  id: string; // uuid for list key
  name: string; // from selected asset
  stageName: string; // optional user-defined name
}

export interface PublicIO {
  id: string; // uuid
  name: string;
  type: 'String' | 'Int' | 'Bool';
  description: string;
}

export type ConnectionSourceType = 'Public Input' | 'Stage Output Field';
export type ConnectionDestType = 'Stage Input Field' | 'Workflow Input' | 'Public Output';

export interface Connection {
    id: string; // uuid
    sourceType: ConnectionSourceType;
    source: string;
    sourceField: string;
    destinationType: ConnectionDestType;
    destination: string;
    destinationField: string;
}

export interface WizardFormData {
    workflowConfig: WorkflowConfig;
    stages: WizardStage[];
    publicInputs: PublicIO[];
    publicOutputs: PublicIO[];
    connections: Connection[];
}