
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">Flower</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="rounded-full p-2 hover:bg-gray-100">
          <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        </button>
        <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/100/100" alt="User avatar" />
      </div>
    </header>
  );
};

export default Header;
