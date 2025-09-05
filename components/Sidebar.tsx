import React from 'react';

const FlowerLogo = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.6667 4.66667L14 2.33333L16.3333 4.66667L14 7L11.6667 4.66667Z" fill="#34A853"/>
        <path d="M4.66667 11.6667L2.33333 14L4.66667 16.3333L7 14L4.66667 11.6667Z" fill="#EA4335"/>
        <path d="M11.6667 23.3333L14 21L16.3333 23.3333L14 25.6667L11.6667 23.3333Z" fill="#4285F4"/>
        <path d="M23.3333 11.6667L21 14L23.3333 16.3333L25.6667 14L23.3333 11.6667Z" fill="#FBBC04"/>
        <path d="M8.16667 8.16667L10.5 5.83333V10.5L5.83333 15.1667H10.5L8.16667 17.5L12.8333 22.1667V17.5L17.5 12.8333H12.8333L15.1667 10.5L10.5 5.83333L8.16667 8.16667Z" fill="#4285F4"/>
    </svg>
);

const NavIcon: React.FC<{ children: React.ReactNode; active?: boolean; hasDropdown?: boolean }> = ({ children, active, hasDropdown }) => (
    <a href="#" className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-500'}`}>
        {children}
        {hasDropdown && (
            <svg className="absolute -bottom-1 -right-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
        )}
    </a>
);

const Sidebar: React.FC = () => {
    return (
        <div className="flex h-full w-20 flex-col items-center bg-white border-r py-4">
            <div className="flex h-16 w-full items-center justify-center text-blue-600">
                <FlowerLogo />
            </div>
            <div className="flex flex-1 flex-col items-center space-y-4 pt-6">
                <NavIcon>
                     <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 3.532a.75.75 0 01.998.05l8.5 9.5a.75.75 0 01-.527 1.284H18a.75.75 0 00-.75.75v5.184a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V15a.75.75 0 00-.75-.75h-2.22a.75.75 0 01-.527-1.284l8.5-9.5a.75.75 0 01.498-.298z" />
                    </svg>
                </NavIcon>
                <NavIcon hasDropdown>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-5.234-4.266-9.5-9.5-9.5S.5 6.766.5 12s4.266 9.5 9.5 9.5 9.5-4.266 9.5-9.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
                    </svg>
                </NavIcon>
                 <NavIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.5h4.5m-4.5-6h4.5m-4.5-6h4.5M9 19.5h-3a1.5 1.5 0 01-1.5-1.5v-12A1.5 1.5 0 016 4.5h3a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5z" />
                    </svg>
                </NavIcon>
                <NavIcon active>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                </NavIcon>
            </div>
        </div>
    );
};

export default Sidebar;
