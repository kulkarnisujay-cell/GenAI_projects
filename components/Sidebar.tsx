
import React from 'react';
import { ChatIcon } from './icons/ChatIcon';

const Sidebar: React.FC = () => {
  return (
    <div className="flex h-full w-16 flex-col items-center bg-white border-r">
      <div className="flex h-16 w-full items-center justify-center border-b text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v3.136a2.994 2.994 0 015.343 1.612c0 1.264-.72 2.38-1.783 2.84a.75.75 0 01-.9-.636v-3.136a2.994 2.994 0 01-5.343-1.612c0-1.264.72-2.38 1.783-2.84A.75.75 0 0112 2.25zM12.75 9a.75.75 0 00-1.5 0v3.136a2.994 2.994 0 005.343 1.612c0 1.264-.72 2.38-1.783 2.84a.75.75 0 00-.9-.636V12.81a2.994 2.994 0 00-5.343-1.612c0-1.264.72-2.38 1.783-2.84a.75.75 0 00.9.636V9zM12 15.75a.75.75 0 01.75.75v3.136a2.994 2.994 0 015.343 1.612c0 1.264-.72 2.38-1.783 2.84a.75.75 0 01-.9-.636v-3.136a2.994 2.994 0 01-5.343-1.612c0-1.264.72-2.38 1.783-2.84a.75.75 0 01.15.025z"/></svg>
      </div>
      <div className="flex flex-1 flex-col items-center space-y-4 pt-4">
        <a href="#" className="rounded-lg bg-blue-100 p-2 text-blue-600">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </a>
        <a href="#" className="p-2 text-gray-400 hover:text-blue-600">
           <ChatIcon className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
