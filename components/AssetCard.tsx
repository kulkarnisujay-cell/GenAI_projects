
import React from 'react';
import { Asset } from '../types';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: (asset: Asset, isSelected: boolean) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, isSelected, onSelect }) => {
  const handleSelect = () => {
    onSelect(asset, !isSelected);
  };
  
  return (
    <div
      onClick={handleSelect}
      className={`group cursor-pointer rounded-lg border bg-white p-5 transition-all hover:shadow-lg ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-400'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold">{asset.name}</h4>
            {asset.isNew && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">New</span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">{asset.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <ArrowRightIcon className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};

export default AssetCard;
