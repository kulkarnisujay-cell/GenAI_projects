import { Asset } from '../types';

export const mockAssets: Asset[] = [
    { id: '1', name: 'CODEMAKER', description: 'Generates code based on specifications. Highly reusable for various build processes.', type: 'stage', isNew: true, category: 'Build', owner: 'jarvis-team' },
    { id: '2', name: 'SUBMIT_CHANGELIST', description: 'Submits a changelist to version control. Essential for CI/CD pipelines.', type: 'stage', isNew: true, category: 'CI/CD', owner: 'jarvis-team' },
    { id: '3', name: 'UPDATE_DESCRIPTION', description: 'Updates the description of a CL or a Buganizer issue.', type: 'stage', category: 'Tooling', owner: 'developer-tools' },
    { id: '4', name: 'SYNC_GREEN_CL', description: 'Syncs a "green" (passing tests) changelist to the main branch.', type: 'workflow', category: 'CI/CD', owner: 'jarvis-team' },
    { id: '5', name: 'CREATE_BUGANIZER_ISSUE', description: 'Creates a new issue in Buganizer from workflow context.', type: 'stage', category: 'Tooling', owner: 'developer-tools' },
    { id: '6', name: 'STANDARD_RELEASE_PIPELINE', description: 'A complete workflow for a standard service release process.', type: 'workflow', category: 'Release', owner: 'sre-team' },
    { id: '7', name: 'RUN_UNIT_TESTS', description: 'Executes unit tests for a specified target.', type: 'stage', category: 'Testing', owner: 'testing-infra' },
    { id: '8', name: 'DEPLOY_TO_STAGING', description: 'Deploys a build to the staging environment.', type: 'stage', category: 'Release', owner: 'sre-team' },
  ];
  