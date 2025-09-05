import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AgentAction } from '../types';
import { startChat, sendMessageStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import { SendIcon } from './icons/SendIcon';
import { PlusIcon } from './icons/PlusIcon';
import { mockAssets } from '../data/assets';
// Fix: Import ArrowRightIcon to fix 'Cannot find name' error.
import { ArrowRightIcon } from './icons/ArrowRightIcon';

// New icons for agent panel
const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.681 4.06c.064.155.19.284.348.348l4.06 1.681c.772.321.772 1.415 0 1.736l-4.06 1.681c-.158.064-.284.19-.348.348l-1.681 4.06c-.321.772-1.415.772-1.736 0l-1.681-4.06c-.064-.155-.19-.284-.348-.348l-4.06-1.681c-.772-.321-.772-1.415 0-1.736l4.06-1.681c.158.064.284.19.348.348l1.681-4.06z" clipRule="evenodd" />
    </svg>
);
const SuggestionIcon: React.FC<{ type: 'summarize' | 'list' | 'latency' }> = ({ type }) => {
    const paths = {
        summarize: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />,
        list: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5m-9-3 .75 .75 2.25-2.25M3 12l.75.75 2.25-2.25m-3 6 .75 .75 2.25-2.25" />,
        latency: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.28m5.94 2.28L19.5 21M12 2.25v2.25m0 15v2.25M4.5 12H2.25m19.5 0h-2.25" />
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            {paths[type]}
        </svg>
    )
};


interface AgentPanelProps {
  onAgentAction: (action: AgentAction) => void;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ onAgentAction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);

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
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent, messageText?: string) => {
    e.preventDefault();
    const currentInput = messageText || input;
    if (!currentInput.trim() || isGenerating || !chat) return;
    setShowChat(true);

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: currentInput };
    setMessages(prev => [...prev, userMessage]);
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
      } catch (e) { /* Not a JSON response */ }

      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId ? { ...msg, text: displayText, isGenerating: false } : msg
      ));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === agentMessageId ? { ...msg, text: "Sorry, I encountered an error.", isGenerating: false } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const SuggestionChip: React.FC<{text: string; detail:string; iconType: 'summarize'|'list'|'latency'}> = ({text, detail, iconType}) => (
      <button 
        onClick={(e) => handleSendMessage(e, text)}
        className="w-full flex items-center gap-4 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-left"
      >
          <SuggestionIcon type={iconType} />
          <div>
              <p className="font-semibold text-sm text-slate-800">{text}</p>
              <p className="text-xs text-gray-500">{detail}</p>
          </div>
      </button>
  );

  return (
    <aside className="w-[380px] flex-shrink-0 flex flex-col border-l bg-white">
      <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <SparkleIcon className="w-5 h-5 text-slate-700"/>
            AI agent
        </h3>
        <div className="flex items-center gap-2 text-gray-400">
            <button className="hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>
             <button className="hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
            </button>
             <button className="hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
        {!showChat ? (
             <div className="text-left">
                <p className="text-lg text-slate-600">Hello, Jane</p>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">How can I help you today?</h1>
                <p className="text-sm text-gray-500 mt-4">In the Agent mode, you can provide me instructions to complete a task that may take multiple steps.</p>

                <div className="mt-6 space-y-3">
                    <SuggestionChip text="Summarize this pipeline" detail="in more detail" iconType="summarize" />
                    <SuggestionChip text="List action items" detail="from this pipeline view" iconType="list" />
                    <SuggestionChip text="Check for high latency" detail="to this pipeline" iconType="latency" />
                </div>
                <button className="text-sm font-medium text-blue-600 hover:underline mt-4 flex items-center gap-1">
                    <span>More suggestions</span>
                    <ArrowRightIcon className="h-4 w-4"/>
                </button>
            </div>
        ) : (
            <div className="space-y-4">
            {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-slate-800'}`}>
                {message.text}
                {message.isGenerating && !message.text && (
                    <div className="flex items-center justify-center p-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                )}
                </div>
            </div>
            ))}
            </div>
        )}
      </div>

      <div className="border-t p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
            placeholder="Enter a prompt here"
            className="w-full resize-none rounded-lg border bg-white border-gray-300 text-slate-800 placeholder-gray-400 py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <PlusIcon className="h-6 w-6"/>
            </button>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
             <button 
              type="submit" 
              className="bg-gray-800 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-900 disabled:bg-gray-300"
              disabled={!input.trim() || isGenerating}
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
         <p className="text-xs text-gray-400 mt-2 text-center">AI may display inaccurate information, including about people, so double-check its responses. <a href="#" className="underline">Learn more</a></p>
      </div>
    </aside>
  );
};

export default AgentPanel;