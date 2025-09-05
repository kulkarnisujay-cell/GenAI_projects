import { Asset } from '../types';

export const mockAssets: Asset[] = [
    { 
      id: '2', name: 'SUBMIT_CHANGELIST', 
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.', 
      type: 'stage', isNew: true, category: 'CI/CD', owner: 'jarvis-team',
      tag: 'Prod', tagColor: 'pink', avatar: '🤖', pinned: true
    },
    { 
      id: '1', name: 'CODEMAKER', 
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.', 
      type: 'stage', isNew: true, category: 'Build', owner: 'jarvis-team',
      tag: 'Non-prod', tagColor: 'cyan', avatar: 'A', pinned: true
    },
     { 
      id: '6', name: 'CODEMAKER', 
      description: 'This is a block of placeholder text. You can replace it when you\'re ready.', 
      type: 'stage', category: 'Build', owner: 'jarvis-team',
      tag: 'Prod', tagColor: 'pink', avatar: '🧑‍💻'
    },
    { 
      id: '3', name: 'UPDATE_DESCRIPTION', 
      description: 'Updates the description of a CL or a Buganizer issue.', 
      type: 'stage', category: 'Tooling', owner: 'developer-tools',
      tag: 'Prod', tagColor: 'pink', avatar: '🤖'
    },
    { 
      id: '4', name: 'SYNC_GREEN_CL', 
      description: 'Syncs a "green" (passing tests) changelist to the main branch.', 
      type: 'workflow', category: 'CI/CD', owner: 'jarvis-team',
      tag: 'Non-prod', tagColor: 'cyan', avatar: 'A'
    },
    { 
      id: '5', name: 'CREATE_BUGANIZER_ISSUE', 
      description: 'Creates a new issue in Buganizer from workflow context.', 
      type: 'stage', category: 'Tooling', owner: 'developer-tools',
      tag: 'Prod', tagColor: 'pink', avatar: '🧑‍💻'
    },
  ];