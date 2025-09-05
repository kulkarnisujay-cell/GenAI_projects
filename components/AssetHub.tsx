import React, { useState } from 'react';
import { Asset } from '../types';
import AssetCard from './AssetCard';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { GridIcon } from './icons/GridIcon';
import { TableIcon } from './icons/TableIcon';

const mockAssets: Asset[] = [
  { id: '1', name: 'CODEMAKER', description: 'Generates code based on specifications. Highly reusable for various build processes.', type: 'stage', isNew: true, category: 'Build', owner: 'jarvis-team' },
  { id: '2', name: 'SUBMIT_CHANGELIST', description: 'Submits a changelist to version control. Essential for CI/CD pipelines.', type: 'stage', isNew: true, category: 'CI/CD', owner: 'jarvis-team' },
  { id: '3', name: 'UPDATE_DESCRIPTION', description: 'Updates the description of a CL or a Buganizer issue.', type: 'stage', category: 'Tooling', owner: 'developer-tools' },
  { id: '4', name: 'SYNC_GREEN_CL', description: 'Syncs a "green" (passing tests) changelist to the main branch.', type: 'workflow', category: 'CI/CD', owner: 'jarvis-team' },
  { id: '5', name: 'CREATE_BUGANIZER_ISSUE', description: 'Creates a new issue in Buganizer from workflow context.', type: 'stage', category: 'Tooling', owner: 'developer-tools' },
  { id: '6', name: 'STANDARD_RELEASE_PIPELINE', description: 'A complete workflow for a standard service release process.', type: 'workflow', category: 'Release', owner: 'sre-team' },
  { id: '7', name: 'RUN_UNIT_TESTS', description: 'Executes unit tests for a specified target.', type: 'stage', category: 'Testing', owner: 'testing-infra' },
  { id: '8', name: 'DEPLOY_TO_STAGING', description: 'Deploys a build to the staging environment.', type: 'stage', category: 'Release', owner: 'sre-team' },
];

interface AssetHubProps {
  selectedAssets: Asset[];
  onAssetSelect: (asset: Asset, isSelected: boolean) => void;
}

const AssetHub: React.FC<AssetHubProps> = ({ selectedAssets, onAssetSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = mockAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentlyUpdatedAssets = filteredAssets.filter(a => a.isNew);
  const mostPopularAssets = filteredAssets.filter(a => !a.isNew);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-gray-50">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold">Stage Marketplace</h2>
        <p className="text-gray-500 mt-1">Select one or more assets below to begin building your workflow, or ask the agent for help.</p>
      </div>

      <div className="flex items-center space-x-2 mt-6 flex-shrink-0">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by keyword"
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 rounded-md border bg-white px-4 py-2 text-sm hover:bg-gray-50">
          <span>Category: All</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center rounded-md border bg-white">
          <button className="rounded-l-md bg-blue-100 p-2 text-blue-600"><GridIcon className="h-5 w-5"/></button>
          <button className="p-2 text-gray-400 hover:text-blue-600"><TableIcon className="h-5 w-5"/></button>
        </div>
      </div>

      <div className="mt-8 flex-grow pb-24">
        <div>
          <h3 className="text-lg font-semibold">Recently updated</h3>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {recentlyUpdatedAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAssets.some(a => a.id === asset.id)}
                onSelect={onAssetSelect}
              />
            ))}
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Most popular</h3>
           <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {mostPopularAssets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAssets.some(a => a.id === asset.id)}
                onSelect={onAssetSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetHub;