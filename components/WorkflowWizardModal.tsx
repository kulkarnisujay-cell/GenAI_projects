import React, { useState, useEffect, useRef } from 'react';
import { Asset, ChatMessage } from '../types';
import { sendMessageStream, startChat } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const CODE_GENERATION_PROMPT = `You are the Jarvis Onboarding Agent, an expert AI assistant that helps developers create new workflows for the Flower platform. Your primary function is to take a structured set of specifications for a workflow and generate a complete, valid C++ workflow definition in JCL format. The user will provide all necessary details, including selected stages, dependencies, and connections. When asked to generate, your primary output should be the complete C++ code within a single \`\`\`cpp ... \`\`\` block. You can provide a brief confirmation before the code, like "Certainly, here is the generated workflow:". The code should be a plausible example of a JCL workflow definition based on the inputs.`;

// Form data structure
interface WorkflowFormData {
  workflowType: string;
  description: string;
  directory: string;
  publicInputs: string;
  publicOutputs: string;
  dependencies: string;
  fieldConnections: string;
  inputConnections: string;
}

interface WorkflowWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedAssets: Asset[];
}

const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({ isOpen, onClose, onBack, selectedAssets }) => {
  const [formData, setFormData] = useState<WorkflowFormData>({
    workflowType: 'Fleet',
    description: '',
    directory: '',
    publicInputs: '',
    publicOutputs: '',
    dependencies: '',
    fieldConnections: '',
    inputConnections: '',
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize chat when modal opens
    if (isOpen) {
      startChat(CODE_GENERATION_PROMPT); // Use the specific code generation prompt
      const assetNames = selectedAssets.map(a => `\`${a.name}\``).join(', ');
      setMessages([
        { id: '1', sender: 'agent', text: `Hello! Let's create a new workflow. I see you've selected: ${assetNames}.` },
        { id: '2', sender: 'agent', text: 'Please fill out the details on the left, and I\'ll generate the C++ JCL code for you.' }
      ]);
    }
  }, [isOpen, selectedAssets]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const userPrompt = `Please generate the workflow code based on this information.`;
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userPrompt };
    setMessages(prev => [...prev, userMessage]);
    
    const agentResponseId = (Date.now() + 1).toString();
    const agentTypingMessage: ChatMessage = { id: agentResponseId, sender: 'agent', text: '', isGenerating: true };
    setMessages(prev => [...prev, agentTypingMessage]);
    
    // Construct the prompt from form data
    const fullPrompt = `
      I need to create a new workflow with the following specifications.
      - Selected Stages/Workflows: ${selectedAssets.map(a => a.name).join(', ')}
      - Workflow Type: ${formData.workflowType}
      - Description: ${formData.description}
      - Directory for workflow code: ${formData.directory}
      - Public Inputs: ${formData.publicInputs}
      - Public Outputs: ${formData.publicOutputs}
      - Stage/Workflow Dependencies: ${formData.dependencies}
      - Stage/Workflow Field Connections: ${formData.fieldConnections}
      - Public Input Connections: ${formData.inputConnections}

      Please generate the complete C++ JCL code.
    `;
    
    try {
      const stream = await sendMessageStream(fullPrompt);
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => prev.map(msg => 
            msg.id === agentResponseId ? { ...msg, text: fullText, isGenerating: true } : msg
        ));
      }
      setMessages(prev => prev.map(msg => 
          msg.id === agentResponseId ? { ...msg, text: fullText, isGenerating: false } : msg
      ));
    } catch (error) {
       console.error('Error generating workflow:', error);
       const errorMessage: ChatMessage = {
        id: agentResponseId,
        sender: 'agent',
        text: 'Sorry, I encountered an error during generation. Please check the console for details.',
      };
      setMessages(prev => prev.map(msg => msg.id === agentResponseId ? errorMessage : msg));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderInputField = (name: keyof WorkflowFormData, label: string, placeholder: string, type: 'input' | 'textarea' = 'input') => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {type === 'input' ? (
        <input
          type="text"
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={placeholder}
          disabled={isLoading}
        />
      ) : (
        <textarea
          id={name}
          name={name}
          rows={3}
          value={formData[name]}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={placeholder}
          disabled={isLoading}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        <header className="relative flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back to Hub</span>
              </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 absolute left-1/2 -translate-x-1/2">New Workflow Creation Agent</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Form Panel */}
          <div className="w-2/3 border-r p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Details</h3>
            <p className="text-sm text-gray-500 mt-1">Provide the following information for your new workflow.</p>
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                 <h4 className="text-sm font-semibold">Selected Stages</h4>
                 <ul className="mt-2 flex flex-wrap gap-2">
                   {selectedAssets.map(asset => (
                     <li key={asset.id} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">{asset.name}</li>
                   ))}
                 </ul>
              </div>
              {renderInputField('workflowType', 'Workflow Type', 'e.g., Fleet, Service, etc.')}
              {renderInputField('description', 'Description', 'A brief summary of what this workflow does.', 'textarea')}
              {renderInputField('directory', 'Directory for workflow code', '/path/to/your/workflow/code')}
              {renderInputField('publicInputs', 'Public Inputs', 'e.g., change_list_id, bug_id', 'textarea')}
              {renderInputField('publicOutputs', 'Public Outputs', 'e.g., build_status, deployment_url', 'textarea')}
              {renderInputField('dependencies', 'Stage/Workflow Dependencies', 'Specify dependencies between stages, e.g., CODEMAKER -> SUBMIT_CHANGELIST', 'textarea')}
              {renderInputField('fieldConnections', 'Stage/Workflow Field Connections', 'Connect output fields to input fields.', 'textarea')}
              {renderInputField('inputConnections', 'Public Input Connections', 'Connect public inputs to stage inputs.', 'textarea')}
            </div>
          </div>

          {/* Agent Panel */}
          <div className="w-1/3 flex flex-col bg-gray-50">
             <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                       {msg.isGenerating && msg.text === '' && <div className="h-5 w-2.5 bg-gray-400 animate-pulse rounded-sm"></div>}
                       {msg.text.split('```cpp').map((part, index) => {
                          if (index === 0) return <p key={index} className="whitespace-pre-wrap">{part}</p>;
                          const codeBlock = part.split('```')[0];
                          const restOfText = part.split('```')[1];
                          return (
                              <div key={index}>
                                <div className="bg-gray-800 text-white rounded-md p-3 my-2 text-sm overflow-x-auto">
                                  <pre><code>{codeBlock}</code></pre>
                                </div>
                                <p className="whitespace-pre-wrap">{restOfText}</p>
                              </div>
                          )
                       })}
                       {msg.isGenerating && <div className="h-3 w-3 bg-blue-200 animate-pulse rounded-full mt-1.5 ml-1 inline-block"></div>}
                    </div>
                  </div>
                ))}
            </div>
             <div className="p-4 border-t bg-white">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Generating...' : 'Generate Workflow'}
                  <SendIcon className="h-5 w-5"/>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowWizardModal;