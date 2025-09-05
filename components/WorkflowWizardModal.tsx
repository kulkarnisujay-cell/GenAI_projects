import React, { useState, useEffect } from 'react';
import { Asset, WizardFormData, WizardStage } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface WorkflowWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
}

const STEPS = ['Configuration', 'Stages', 'Inputs & Outputs', 'Connections', 'Review'];

const initialFormData: Omit<WizardFormData, 'stages'> = {
  workflowConfig: {
    workflowType: '',
    fleet: 'NON_PROD',
    directory: '',
    description: '',
  },
  publicInputs: [],
  publicOutputs: [],
  connections: [],
};

const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({ isOpen, onClose, selectedAssets }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>({
    ...initialFormData,
    stages: []
  });
  
  useEffect(() => {
    if (isOpen) {
      const initialStages: WizardStage[] = selectedAssets
        .filter(asset => asset.type === 'stage')
        .map(asset => ({
          id: `${asset.id}-${Math.random()}`, // Using Math.random for simplicity as no uuid library is available
          name: asset.name,
          stageName: asset.name,
        }));
      setFormData({
        ...initialFormData,
        stages: initialStages
      });
      setCurrentStep(0);
    }
  }, [isOpen, selectedAssets]);
  
  if (!isOpen) return null;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (section === 'workflowConfig') {
        setFormData(prev => ({
            ...prev,
            workflowConfig: {
                ...prev.workflowConfig,
                [field]: value
            }
        }));
    }
  };

  const handleStageNameChange = (index: number, newName: string) => {
    const newStages = [...formData.stages];
    newStages[index].stageName = newName;
    setFormData(prev => ({ ...prev, stages: newStages }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Configuration
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">Workflow Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Workflow Type Name</label>
                <input type="text" name="workflowConfig.workflowType" value={formData.workflowConfig.workflowType} onChange={handleFormChange} placeholder="e.g., MyAwesomeWorkflow" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fleet</label>
                <select name="workflowConfig.fleet" value={formData.workflowConfig.fleet} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="NON_PROD">NON_PROD</option>
                  <option value="PROD">PROD</option>
                  <option value="TESTING">TESTING</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Directory</label>
                <input type="text" name="workflowConfig.directory" value={formData.workflowConfig.directory} onChange={handleFormChange} placeholder="/path/to/workflow" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="workflowConfig.description" value={formData.workflowConfig.description} onChange={handleFormChange} rows={3} placeholder="A brief description of what this workflow does." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        );
      case 1: // Stages
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">Stages</h3>
            <p className="text-sm text-gray-500 mb-4">The following stages were added from your selection. You can rename them for this workflow instance.</p>
            <div className="space-y-4">
              {formData.stages.length > 0 ? formData.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-4 p-3 border rounded-md bg-gray-50">
                  <span className="font-mono text-sm bg-gray-200 py-1 px-2 rounded">{stage.name}</span>
                  <input
                    type="text"
                    value={stage.stageName}
                    onChange={(e) => handleStageNameChange(index, e.target.value)}
                    className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )) : (
                <p className="text-gray-500">No stages selected. Please go back and select some stage assets.</p>
              )}
            </div>
          </div>
        );
      case 2: // Inputs & Outputs
      case 3: // Connections
      case 4: // Review
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">{STEPS[currentStep]}</h3>
            <div className="text-center text-gray-400 border-2 border-dashed rounded-lg p-12 mt-4">
                <p>This feature is not yet implemented.</p>
                <p>Click "Next" to proceed or "Create Workflow" on the final step.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Workflow</h2>
          <p className="text-gray-500 mt-1">Follow the steps to configure your new workflow using the selected assets.</p>
        </div>

        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {index < currentStep ? <CheckCircleIcon className="w-5 h-5"/> : index + 1}
                  </div>
                  <span className={`ml-3 font-medium transition-colors ${index <= currentStep ? 'text-gray-800' : 'text-gray-500'}`}>{step}</span>
                </div>
                {index < STEPS.length - 1 && <div className={`flex-1 h-1 mx-4 transition-colors ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto">
          {renderStepContent()}
        </div>

        <div className="p-6 border-t flex justify-between items-center bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 rounded-md hover:bg-gray-100 font-medium text-gray-700">Cancel</button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-50">
                <ArrowLeftIcon className="w-5 h-5"/>
                <span>Back</span>
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button onClick={handleNext} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                <span>Next</span>
                <ArrowRightIcon className="w-5 h-5"/>
              </button>
            ) : (
              <button onClick={onClose} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700">
                <CheckCircleIcon className="w-5 h-5"/>
                <span>Create Workflow</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowWizardModal;
