import React, { useState, useEffect, useRef } from 'react';
import { Asset, ChatMessage, AgentAction } from '../types';
import { startChat, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { SendIcon } from './icons/SendIcon';
import { PlusIcon } from './icons/PlusIcon';
import { mockAssets } from '../data/assets';

interface AgentPanelProps {
  selectedAssets: Asset[];
  onClearSelection: () => void;
  onAgentAction: (action: AgentAction) => void;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ selectedAssets, onClearSelection, onAgentAction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const assetList = mockAssets.map(a => `'${a.name}'`).join(', ');
    const systemInstruction = `You are an expert workflow assistant for the "Flower Asset Hub". The user can see a list of assets.
Available assets: ${assetList}.

When a user asks you to find or show them a specific asset from the list, you MUST respond with a single, valid JSON object and nothing else. This object must have a 'response' key with your text for the user, and an 'action' key to highlight the asset in the UI.

Example User Query: "show me the create buganizer issue stage"
Example JSON Response:
{
  "response": "Of course. The 'CREATE_BUGANIZER_ISSUE' stage is used for creating new issues. I've highlighted it for you on the left.",
  "action": { "type": "highlight_asset", "assetName": "CREATE_BUGANIZER_ISSUE" }
}

For any other conversational questions, just respond with plain text.`;
    
    const newChat = startChat(systemInstruction);
    setChat(newChat);
    setMessages([
      { id: '1', sender: 'agent', text: 'Hello! How can I help you? Ask me to find a stage or workflow.' }
    ]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating || !chat) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsGenerating(true);

    const agentMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: agentMessageId, sender: 'agent', text: '', isGenerating: true }]);

    try {
      const stream = await sendMessageStream(chat, currentInput);
      let agentResponse = '';
      for await (const chunk of stream) {
        agentResponse += chunk.text;
      }

      let displayText = agentResponse;
      try {
        const cleanedResponse = agentResponse.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedResponse);
        if (parsed.response && parsed.action) {
          displayText = parsed.response;
          if (parsed.action.type === 'highlight_asset' && parsed.action.assetName) {
            onAgentAction(parsed.action);
          }
        }
      } catch (e) {
        // Not a JSON response, treat as plain text.
      }

      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId ? { ...msg, text: displayText, isGenerating: false } : msg
      ));
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId ? { ...msg, text: "Sorry, I encountered an error.", isGenerating: false } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const Spinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;

  return (
    <aside className="w-96 flex flex-col border-l bg-white">
      <div className="flex-shrink-0 p-4 border-b">
        <h3 className="text-lg font-semibold">Workflow Agent</h3>
      </div>
      
      {selectedAssets.length > 0 && (
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm">Selected Assets ({selectedAssets.length})</h4>
            <button onClick={onClearSelection} className="text-blue-600 hover:underline text-sm font-medium">Clear</button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedAssets.map(asset => (
              <div key={asset.id} className="bg-gray-100 p-2 rounded-md text-sm">
                <p className="font-medium text-gray-800">{asset.name}</p>
                <p className="text-gray-500 truncate">{asset.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
              {message.text}
              {message.isGenerating && !message.text && (
                 <div className="flex items-center justify-center p-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            placeholder="Find a stage for me..."
            className="w-full resize-none rounded-lg border border-gray-300 py-3 pl-4 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button type="button" className="text-gray-400 hover:text-blue-600">
              <PlusIcon className="h-5 w-5"/>
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white rounded-md h-8 w-8 flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300"
              disabled={!input.trim() || isGenerating}
            >
              {isGenerating ? <Spinner/> : <SendIcon className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};

export default AgentPanel;