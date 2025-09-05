import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '../types';
import AssetCard from './AssetCard';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { GridIcon } from './icons/GridIcon';
import { TableIcon } from './icons/TableIcon';
import { mockAssets } from '../data/assets';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
// Fix: Import ArrowRightIcon to fix 'Cannot find name' error.
import { ArrowRightIcon } from './icons/ArrowRightIcon';

const Illustration = () => (
    <svg width="200" height="120" viewBox="0 0 200 120" className="absolute top-0 right-6 hidden lg:block">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgb(165, 180, 252)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(192, 132, 252)', stopOpacity: 1}} />
            </linearGradient>
        </defs>
        <rect x="100" y="50" width="60" height="60" rx="8" fill="url(#grad1)" />
        <rect x="110" y="20" width="50" height="50" rx="8" fill="#fff" className="stroke-gray-200" strokeWidth="2"/>
        <rect x="118" y="28" width="34" height="34" rx="4" fill="#E0E7FF"/>
        <circle cx="70" cy="80" r="25" fill="#C7D2FE"/>
        <path d="M 60 110 C 80 90, 100 90, 120 110" stroke="#4F46E5" fill="transparent" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);


interface AssetHubProps {
  selectedAssets: Asset[];
  onAssetSelect: (asset: Asset, isSelected: boolean) => void;
  highlightedAssetId: string | null;
}

const AssetHub: React.FC<AssetHubProps> = ({ selectedAssets, onAssetSelect, highlightedAssetId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPopular, setShowAllPopular] = useState(false);
  const assetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightedAssetId) {
        const ref = assetRefs.current[highlightedAssetId];
        ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedAssetId]);

  const filteredAssets = mockAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentlyUpdatedAssets = filteredAssets.filter(a => a.isNew);
  const mostPopularAssets = showAllPopular ? filteredAssets.filter(a => !a.isNew) : filteredAssets.filter(a => !a.isNew).slice(0, 3);

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="relative flex-shrink-0">
        <h2 className="text-3xl font-bold text-slate-900">Asset hub</h2>
        <p className="text-gray-500 mt-2">This is a block of placeholder text. You can replace it with your own content when you're ready.</p>
        <Illustration />
      </div>

      <div className="flex items-center space-x-2 mt-8 flex-shrink-0">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by keyword"
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center space-x-2 rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
          <span>Category: All</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <button className="flex items-center space-x-2 rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
          <span>Owner</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
         <button className="flex items-center space-x-2 rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
          <span>Team</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center rounded-lg border bg-white">
          <button className="rounded-l-lg bg-blue-100 p-3 text-blue-600"><GridIcon className="h-5 w-5"/></button>
          <button className="p-3 text-gray-400 hover:text-blue-600"><TableIcon className="h-5 w-5"/></button>
        </div>
      </div>

      <div className="mt-8 flex-grow pb-24">
        <div>
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold">Recently updated</h3>
             <button className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                <span>Show more</span>
                <ArrowRightIcon className="h-4 w-4"/>
             </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {recentlyUpdatedAssets.map(asset => (
              <div key={asset.id} ref={el => { assetRefs.current[asset.id] = el; }}>
                <AssetCard
                  asset={asset}
                  isSelected={selectedAssets.some(a => a.id === asset.id)}
                  onSelect={onAssetSelect}
                  isHighlighted={asset.id === highlightedAssetId}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold">Most popular</h3>
             <button onClick={() => setShowAllPopular(!showAllPopular)} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                <span>{showAllPopular ? 'Show less' : 'Show more'}</span>
                {showAllPopular ? <ChevronUpIcon className="h-4 w-4"/> : <ChevronDownIcon className="h-4 w-4"/> }
             </button>
          </div>
           <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {mostPopularAssets.map(asset => (
               <div key={asset.id} ref={el => { assetRefs.current[asset.id] = el; }}>
                <AssetCard
                  asset={asset}
                  isSelected={selectedAssets.some(a => a.id === asset.id)}
                  onSelect={onAssetSelect}
                  isHighlighted={asset.id === highlightedAssetId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetHub;