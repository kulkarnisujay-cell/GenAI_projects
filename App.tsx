import React, { useState } from 'react';
import { Asset, AgentAction } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AssetHub from './components/AssetHub';
import WorkflowWizardModal from './components/WorkflowWizardModal';
import AgentPanel from './components/AgentPanel';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';
import { mockAssets } from './data/assets';

const CreateWorkflowBanner: React.FC<{ count: number; onOpen: () => void }> = ({ count, onOpen }) => {
  if (count === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-auto animate-fade-in-up z-10">
      <div className="bg-blue-500 text-white rounded-lg shadow-2xl flex items-center justify-between py-3 px-5 gap-6">
        <span className="font-medium">{count} asset{count > 1 ? 's' : ''} selected</span>
        <button 
          onClick={onOpen}
          className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <span>Create Workflow</span>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [highlightedAssetId, setHighlightedAssetId] = useState<string | null>(null);

  const handleAssetSelect = (asset: Asset, isSelected: boolean) => {
    setHighlightedAssetId(null); // Clear highlight on any selection change
    if (isSelected) {
      setSelectedAssets(prev => [...prev, asset]);
    } else {
      setSelectedAssets(prev => prev.filter(a => a.id !== asset.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };
  
  const handleAgentAction = (action: AgentAction) => {
    if (action.type === 'highlight_asset') {
      const assetToHighlight = mockAssets.find(a => a.name === action.assetName);
      if (assetToHighlight) {
        setHighlightedAssetId(assetToHighlight.id);
        // Clear the highlight after a few seconds to avoid it being permanent
        setTimeout(() => setHighlightedAssetId(null), 4000);
      }
    }
  };

  const handleOpenWizard = () => {
    if (selectedAssets.length > 0) {
      setIsWizardOpen(true);
    }
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    // Do not clear selection on close, user might want to re-open
  };

  return (
    <div className="flex h-screen w-screen bg-white text-slate-800 antialiased">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="relative flex flex-1 overflow-hidden bg-gray-50">
          <AssetHub 
            selectedAssets={selectedAssets}
            onAssetSelect={handleAssetSelect}
            highlightedAssetId={highlightedAssetId}
          />
          <AgentPanel
            onAgentAction={handleAgentAction}
          />
           <CreateWorkflowBanner count={selectedAssets.length} onOpen={handleOpenWizard} />
        </main>
      </div>
      {isWizardOpen && (
        <WorkflowWizardModal
          isOpen={isWizardOpen}
          onClose={handleCloseWizard}
          selectedAssets={selectedAssets}
        />
      )}
    </div>
  );
};

export default App;