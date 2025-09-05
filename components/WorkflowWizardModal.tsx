import React, { useState, useEffect } from 'react';
import { Asset, WizardFormData, WizardStage, PublicIO, Connection } from '../types';
import { startChat, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface WorkflowWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
}

const initialFormData: WizardFormData = {
  workflowConfig: {
    workflowType: '',
    fleet: 'NON_PROD',
    directory: '',
    description: '',
  },
  stages: [],
  publicInputs: [],
  publicOutputs: [],
  connections: [],
};

const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({ isOpen, onClose, selectedAssets }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
      if(isOpen) {
        // Reset form when modal opens, and initialize stages from selection
        const initialStages: WizardStage[] = selectedAssets.map(asset => ({
            id: crypto.randomUUID(),
            name: asset.name,
            stageName: ''
        }));
        const newFormData = {...initialFormData, stages: initialStages};
        setFormData(newFormData);
        setStep(1);
        setGeneratedCode('');

        const newChat = startChat(
            "You are an expert in JCL (Jarvis Configuration Language). Your task is to generate C++ workflow code in JCL format based on the JSON configuration provided by the user. Do not add any explanations or markdown formatting. Respond only with the raw JCL code."
        );
        setChat(newChat);
      }
  }, [isOpen, selectedAssets]);

  const handleNext = () => setStep(s => Math.min(s + 1, 7));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const updateFormData = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleAddStage = () => {
    updateFormData('stages', [...formData.stages, { id: crypto.randomUUID(), name: '', stageName: '' }]);
  }
  const handleRemoveStage = (id: string) => {
    updateFormData('stages', formData.stages.filter(s => s.id !== id));
  }
  
  const handleAddPublicInput = () => {
    updateFormData('publicInputs', [...formData.publicInputs, { id: crypto.randomUUID(), name: '', type: 'String', description: '' }]);
  }
  const handleRemovePublicInput = (id: string) => {
    updateFormData('publicInputs', formData.publicInputs.filter(i => i.id !== id));
  }

  const handleAddPublicOutput = () => {
    updateFormData('publicOutputs', [...formData.publicOutputs, { id: crypto.randomUUID(), name: '', type: 'String', description: '' }]);
  }
  const handleRemovePublicOutput = (id: string) => {
    updateFormData('publicOutputs', formData.publicOutputs.filter(o => o.id !== id));
  }

  const handleAddConnection = () => {
    updateFormData('connections', [...formData.connections, { id: crypto.randomUUID(), sourceType: 'Public Input', source: '', sourceField: '', destinationType: 'Stage Input Field', destination: '', destinationField: '' }]);
  }
  const handleRemoveConnection = (id: string) => {
    updateFormData('connections', formData.connections.filter(c => c.id !== id));
  }

  const handleGenerateCode = async () => {
    if (!chat) return;
    setIsGenerating(true);
    setGeneratedCode('');
    const prompt = JSON.stringify(formData, null, 2);
    
    try {
        const stream = await sendMessageStream(chat, prompt);
        let response = '';
        for await (const chunk of stream) {
            response += chunk.text;
            setGeneratedCode(response);
        }
    } catch (error) {
        console.error("Generation Error:", error);
        setGeneratedCode("Sorry, an error occurred while generating the code.");
    } finally {
        setIsGenerating(false);
    }
  }

  if (!isOpen) return null;

  const renderStep = () => {
    // Mock data for dropdowns
    const stageFields = ['citc_workspace_name', 'change_id', 'patch_cl'];
    
    switch(step) {
      case 1: // Workflow Configuration
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Workflow Type</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.workflowConfig.workflowType} onChange={e => updateFormData('workflowConfig', {...formData.workflowConfig, workflowType: e.target.value})} />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Fleet</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.workflowConfig.fleet} onChange={e => updateFormData('workflowConfig', {...formData.workflowConfig, fleet: e.target.value as any})}>
                    <option>NON_PROD</option>
                    <option>PROD</option>
                    <option>TESTING</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Directory for Workflow Code</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.workflowConfig.directory} onChange={e => updateFormData('workflowConfig', {...formData.workflowConfig, directory: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Workflow Description</label>
              <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.workflowConfig.description} onChange={e => updateFormData('workflowConfig', {...formData.workflowConfig, description: e.target.value})} />
            </div>
          </div>
        );
      case 2: // Add Stages
        return (
            <div className="space-y-4">
                {formData.stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                        <input type="text" placeholder="Stage Type" className="flex-1 block w-full rounded-md border-gray-300 shadow-sm" value={stage.name} onChange={e => {
                            const newStages = [...formData.stages];
                            newStages[index].name = e.target.value;
                            updateFormData('stages', newStages);
                        }} />
                        <input type="text" placeholder="Stage Name (optional)" className="flex-1 block w-full rounded-md border-gray-300 shadow-sm" value={stage.stageName} onChange={e => {
                             const newStages = [...formData.stages];
                             newStages[index].stageName = e.target.value;
                             updateFormData('stages', newStages);
                        }} />
                        <button onClick={() => handleRemoveStage(stage.id)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
                <button onClick={handleAddStage} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">+ Add Stage</button>
            </div>
        );
       case 3: // Add Public Inputs
            return (
                <div className="space-y-4">
                    {formData.publicInputs.map((input, index) => (
                        <div key={input.id} className="p-3 border rounded-lg bg-gray-50 flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-4">
                                    <input type="text" placeholder="Input Name" className="block w-full rounded-md border-gray-300 shadow-sm" value={input.name} onChange={e => {
                                        const newInputs = [...formData.publicInputs];
                                        newInputs[index].name = e.target.value;
                                        updateFormData('publicInputs', newInputs);
                                    }}/>
                                    <select className="block w-1/3 rounded-md border-gray-300 shadow-sm" value={input.type} onChange={e => {
                                        const newInputs = [...formData.publicInputs];
                                        newInputs[index].type = e.target.value as any;
                                        updateFormData('publicInputs', newInputs);
                                    }}>
                                        <option>String</option>
                                        <option>Int</option>
                                        <option>Bool</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Description" className="block w-full rounded-md border-gray-300 shadow-sm" value={input.description}  onChange={e => {
                                        const newInputs = [...formData.publicInputs];
                                        newInputs[index].description = e.target.value;
                                        updateFormData('publicInputs', newInputs);
                                    }}/>
                            </div>
                            <button onClick={() => handleRemovePublicInput(input.id)} className="text-red-500 hover:text-red-700 p-2 mt-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button onClick={handleAddPublicInput} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">+ Add Input</button>
                </div>
            );
        case 4: // Add Public Outputs
            return (
                <div className="space-y-4">
                    {formData.publicOutputs.map((output, index) => (
                         <div key={output.id} className="p-3 border rounded-lg bg-gray-50 flex items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-4">
                                    <input type="text" placeholder="Output Name" className="block w-full rounded-md border-gray-300 shadow-sm" value={output.name} onChange={e => {
                                        const newOutputs = [...formData.publicOutputs];
                                        newOutputs[index].name = e.target.value;
                                        updateFormData('publicOutputs', newOutputs);
                                    }}/>
                                    <select className="block w-1/3 rounded-md border-gray-300 shadow-sm" value={output.type} onChange={e => {
                                        const newOutputs = [...formData.publicOutputs];
                                        newOutputs[index].type = e.target.value as any;
                                        updateFormData('publicOutputs', newOutputs);
                                    }}>
                                        <option>String</option>
                                        <option>Int</option>
                                        <option>Bool</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Description" className="block w-full rounded-md border-gray-300 shadow-sm" value={output.description}  onChange={e => {
                                        const newOutputs = [...formData.publicOutputs];
                                        newOutputs[index].description = e.target.value;
                                        updateFormData('publicOutputs', newOutputs);
                                    }}/>
                            </div>
                            <button onClick={() => handleRemovePublicOutput(output.id)} className="text-red-500 hover:text-red-700 p-2 mt-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button onClick={handleAddPublicOutput} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">+ Add Output</button>
                </div>
            );
         case 5: // Make Connections
             return (
                <div className="space-y-3">
                    {formData.connections.map((conn, index) => (
                         <div key={conn.id} className="p-3 border rounded-lg bg-gray-50 flex items-center gap-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                <select className="rounded-md border-gray-300 w-full" value={conn.sourceType} onChange={e => { const newConn = [...formData.connections]; newConn[index].sourceType = e.target.value as any; updateFormData('connections', newConn); }}>
                                     <option>Public Input</option>
                                     <option>Stage Output Field</option>
                                </select>
                                {conn.sourceType === 'Public Input' ? (
                                     <select className="rounded-md border-gray-300 w-full" value={conn.source} onChange={e => { const newConn = [...formData.connections]; newConn[index].source = e.target.value; updateFormData('connections', newConn); }}>
                                         <option value="">Select Public Input...</option>
                                         {formData.publicInputs.map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                                     </select>
                                ) : (
                                    <div className="flex gap-2 w-full">
                                        <select className="rounded-md border-gray-300 w-1/2" value={conn.source} onChange={e => { const newConn = [...formData.connections]; newConn[index].source = e.target.value; updateFormData('connections', newConn); }}>
                                            <option value="">Select Stage...</option>
                                            {formData.stages.map(s => <option key={s.id} value={s.stageName || s.name}>{s.stageName || s.name}</option>)}
                                        </select>
                                         <select className="rounded-md border-gray-300 w-1/2" value={conn.sourceField} onChange={e => { const newConn = [...formData.connections]; newConn[index].sourceField = e.target.value; updateFormData('connections', newConn); }}>
                                            <option value="">Select Field...</option>
                                            {stageFields.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                )}
                                <select className="rounded-md border-gray-300 w-full" value={conn.destinationType} onChange={e => { const newConn = [...formData.connections]; newConn[index].destinationType = e.target.value as any; updateFormData('connections', newConn); }}>
                                     <option>Stage Input Field</option>
                                     <option>Public Output</option>
                                     <option>Workflow Input</option>
                                </select>
                                 {conn.destinationType === 'Public Output' ? (
                                      <select className="rounded-md border-gray-300 w-full" value={conn.destination} onChange={e => { const newConn = [...formData.connections]; newConn[index].destination = e.target.value; updateFormData('connections', newConn); }}>
                                         <option value="">Select Public Output...</option>
                                         {formData.publicOutputs.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                                     </select>
                                 ) : (
                                      <div className="flex gap-2 w-full">
                                        <select className="rounded-md border-gray-300 w-1/2" value={conn.destination} onChange={e => { const newConn = [...formData.connections]; newConn[index].destination = e.target.value; updateFormData('connections', newConn); }}>
                                            <option value="">Select Stage...</option>
                                            {formData.stages.map(s => <option key={s.id} value={s.stageName || s.name}>{s.stageName || s.name}</option>)}
                                        </select>
                                         <select className="rounded-md border-gray-300 w-1/2" value={conn.destinationField} onChange={e => { const newConn = [...formData.connections]; newConn[index].destinationField = e.target.value; updateFormData('connections', newConn); }}>
                                            <option value="">Select Field...</option>
                                             {stageFields.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                 )}
                             </div>
                              <button onClick={() => handleRemoveConnection(conn.id)} className="text-red-500 hover:text-red-700 p-2"><TrashIcon className="w-5 h-5"/></button>
                         </div>
                    ))}
                    <button onClick={handleAddConnection} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">+ Add New Connection</button>
                </div>
             );
        case 6: // Review
            return (
                <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-800">Review your workflow configuration before generating the code.</h3>
                    <div className="bg-gray-100 p-4 rounded-md text-sm max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(formData, null, 2)}</pre>
                    </div>
                </div>
            );
        case 7: // Generate
            return (
                <div>
                     <h3 className="text-md font-semibold text-gray-800 mb-4">Generated JCL Code</h3>
                     <div className="bg-gray-800 text-white p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto relative">
                        {isGenerating && !generatedCode && <div className="text-center">Generating...</div>}
                        <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                     </div>
                </div>
            )
      default:
        return null;
    }
  }

  const sections = [
    { number: 1, title: 'Workflow Configuration', isRequired: true },
    { number: 2, title: 'Add Stages', isRequired: true },
    { number: 3, title: 'Add Public Inputs', isRequired: false },
    { number: 4, title: 'Add Public Outputs', isRequired: false },
    { number: 5, title: 'Make Connections', isRequired: false },
    { number: 6, title: 'Review', isRequired: false },
    { number: 7, title: 'Generate', isRequired: false },
  ];

  const currentSection = sections.find(s => s.number === step);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="p-4 border-b flex items-center justify-between flex-shrink-0 bg-white">
            <h2 className="text-lg font-semibold">Jarvis Workflow Onboarding</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              &times;
            </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
             <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-blue-600">{currentSection?.number}. {currentSection?.title}</h2>
                <span className="text-gray-500 font-normal text-lg">{currentSection?.isRequired ? '(Required)' : '(Optional)'}</span>
                {step > 1 && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
             </div>
             <div className="bg-white p-6 rounded-lg border">
                {renderStep()}
             </div>
        </main>
        
        <footer className="p-4 border-t flex items-center justify-between flex-shrink-0 bg-white">
            <button 
                onClick={handleBack} 
                disabled={step === 1}
                className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed">
              Go Back
            </button>
            {step < 6 && (
                 <button onClick={handleNext} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                    Go Next
                 </button>
            )}
             {step === 6 && (
                 <button onClick={handleNext} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700">
                    Continue to Generation
                 </button>
            )}
             {step === 7 && (
                 <button onClick={handleGenerateCode} disabled={isGenerating} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                   {isGenerating ? 'Generating...' : 'Generate Code'}
                 </button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default WorkflowWizardModal;
