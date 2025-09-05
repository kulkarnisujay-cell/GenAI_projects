import React from 'react';
import { Asset } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { PinIcon } from './icons/PinIcon';

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: (asset: Asset, isSelected: boolean) => void;
  isHighlighted: boolean;
}

const tagColors = {
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
  },
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onSelect, isHighlighted }) => {
  const handleSelect = () => {
    onSelect(asset, !isSelected);
  };
  
  const colorScheme = asset.tagColor ? tagColors[asset.tagColor] : { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', hoverBorder: 'hover:border-blue-400' };

  return (
    <div
      onClick={handleSelect}
      className={`group cursor-pointer rounded-lg border bg-white p-5 transition-all flex flex-col justify-between h-full hover:shadow-lg ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500' : `${colorScheme.border} ${colorScheme.hoverBorder}`
      } ${isHighlighted ? 'animate-pulse-bg ring-2 ring-green-500' : ''}`}
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold">{asset.name}</h4>
            {asset.tag && (
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${colorScheme.bg} ${colorScheme.text}`}>{asset.tag}</span>
            )}
          </div>
          {asset.pinned && <PinIcon className="h-5 w-5 text-gray-400" />}
        </div>
        <p className="mt-2 text-sm text-gray-600">{asset.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center -space-x-2">
            {asset.avatar && (
                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border-2 border-white">
                    {asset.avatar}
                </div>
            )}
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default AssetCard;