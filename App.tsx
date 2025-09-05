import React, { useState } from 'react';
import { Asset } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AssetHub from './components/AssetHub';
import WorkflowWizardModal from './components/WorkflowWizardModal';

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

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    handleClearSelection(); 
  };

  return (
    <div className="flex h-screen w-screen text-gray-800 antialiased">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 overflow-hidden">
          <AssetHub 
            selectedAssets={selectedAssets}
            onAssetSelect={handleAssetSelect}
            onOpenWizard={handleOpenWizard}
          />
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