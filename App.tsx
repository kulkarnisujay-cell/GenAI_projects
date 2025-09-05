import React, { useState } from 'react';
import { Asset } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AssetHub from './components/AssetHub';
import WorkflowWizardModal from './components/WorkflowWizardModal';
import AgentPanel from './components/AgentPanel';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';

const CreateWorkflowBanner: React.FC<{ count: number; onOpen: () => void }> = ({ count, onOpen }) => {
  if (count === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-auto animate-fade-in-up z-10">
      <div className="bg-blue-600 text-white rounded-lg shadow-2xl flex items-center justify-between py-3 px-5 gap-6">
        <span className="font-medium">{count} asset{count > 1 ? 's' : ''} selected</span>
        <button 
          onClick={onOpen}
          className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <span>Create Workflow with Agent</span>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleAssetSelect = (asset: Asset, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAssets(prev => [...prev, asset]);
    } else {
      setSelectedAssets(prev => prev.filter(a => a.id !== asset.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  const handleOpenWizard = () => {
    if (selectedAssets.length > 0) {
      setIsWizardOpen(true);
    }
  };

  const handleBackToHub = () => {
    setIsWizardOpen(false);
  };

  const handleCancelWizard = () => {
    setIsWizardOpen(false);
    handleClearSelection(); 
  };

  return (
    <div className="flex h-screen w-screen text-gray-800 antialiased">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="relative flex flex-1 overflow-hidden">
          <AssetHub 
            selectedAssets={selectedAssets}
            onAssetSelect={handleAssetSelect}
          />
          <AgentPanel
            selectedAssets={selectedAssets}
            onClearSelection={handleClearSelection}
          />
           <CreateWorkflowBanner count={selectedAssets.length} onOpen={handleOpenWizard} />
        </main>
      </div>
      {isWizardOpen && (
        <WorkflowWizardModal
          isOpen={isWizardOpen}
          onClose={handleCancelWizard}
          onBack={handleBackToHub}
          selectedAssets={selectedAssets}
        />
      )}
    </div>
  );
};

export default App;