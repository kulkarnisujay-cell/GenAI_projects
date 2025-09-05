import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Asset, ChatMessage } from '../types';
import { sendMessageStream, startChat } from '../services/geminiService';
import { PlusIcon } from './icons/PlusIcon';
import { SendIcon } from './icons/SendIcon';

const GENERAL_ASSISTANT_PROMPT = `You are a helpful AI assistant for the Flower Asset Hub, a marketplace for discovering and reusing software development stages and workflows. Your role is to help developers find relevant assets and understand how to use them. You can answer questions like "find me stages for CI/CD" or "what are the inputs for the SUBMIT_CHANGELIST stage?". You have knowledge about these assets: CODEMAKER, SUBMIT_CHANGELIST, UPDATE_DESCRIPTION, SYNC_GREEN_CL, CREATE_BUGANIZER_ISSUE, STANDARD_RELEASE_PIPELINE, RUN_UNIT_TESTS, DEPLOY_TO_STAGING. Respond conversationally based on the user's query.`;

interface AgentPanelProps {
  selectedAssets: Asset[];
  onClearSelection: () => void;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ selectedAssets, onClearSelection }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const hasStartedChat = useRef(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const initChat = useCallback(() => {
    startChat(GENERAL_ASSISTANT_PROMPT);
    const initialAgentMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'agent',
      text: 'Hello, Jane! How can I help you today? Ask me to find a stage, or select assets to create a workflow.',
    };
    setMessages([initialAgentMessage]);
    hasStartedChat.current = true;
  }, []);

  useEffect(() => {
    if (!hasStartedChat.current) {
        initChat();
    }
  }, [initChat]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const agentResponseId = (Date.now() + 1).toString();
    const agentTypingMessage: ChatMessage = {
        id: agentResponseId,
        sender: 'agent',
        text: '',
        isGenerating: true,
    };
    setMessages(prev => [...prev, agentTypingMessage]);

    try {
      let prompt = userInput;
      if (selectedAssets.length > 0) {
        const assetNames = selectedAssets.map(a => a.name).join(', ');
        prompt = `The user has these assets selected: ${assetNames}. \n\nUser's question: ${userInput}`;
      }
      const stream = await sendMessageStream(prompt);
      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => prev.map(msg => 
            msg.id === agentResponseId ? { ...msg, text: fullText, isGenerating: true } : msg
        ));
      }
      setMessages(prev => prev.map(msg => 
          msg.id === agentResponseId ? { ...msg, text: fullText, isGenerating: false } : msg
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: agentResponseId,
        sender: 'agent',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => prev.map(msg => msg.id === agentResponseId ? errorMessage : msg));
    } finally {
      setIsLoading(false);
      // Do not clear selection on every message anymore
      // onClearSelection(); 
    }
  };
  
  return (
    <aside className="w-full max-w-sm flex-shrink-0 border-l bg-white flex flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h3 className="font-semibold">AI agent</h3>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-xs ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
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

      <div className="border-t p-4">
        <div className="relative">
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Enter a prompt here"
            className="w-full resize-none rounded-md border border-gray-300 p-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 flex items-center">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <PlusIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="ml-2 rounded-md bg-blue-500 p-1.5 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AgentPanel;