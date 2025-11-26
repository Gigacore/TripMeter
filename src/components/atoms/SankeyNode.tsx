import React from 'react';
import { Rectangle } from 'recharts';

interface SankeyNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value: number };
  onShowTripList: (type: string) => void;
}

const SankeyNode: React.FC<SankeyNodeProps> = ({ x, y, width, height, index, payload, onShowTripList }) => {
  const isClickable = payload.name !== 'Total Requests' && payload.value > 0;
  const handleClick = () => {
    if (!isClickable) return;
    const typeMap: { [key: string]: string } = {
      'Successful': 'successful',
      'Rider Canceled': 'rider_canceled',
      'Driver Canceled': 'driver_canceled',
      'Unfulfilled': 'unfulfilled',
    };
    if (typeMap[payload.name]) {
      onShowTripList(typeMap[payload.name]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<SVGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  return (
    <g
      key={`CustomNode${index}`}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`${payload.name}: ${payload.value}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      cursor={isClickable ? 'pointer' : 'default'}
    >
      <Rectangle x={x} y={y} width={width} height={height} fill="#666" fillOpacity="1" />
      <text textAnchor="middle" x={x + width / 2} y={y + height / 2} fontSize="14" fill="#fff" strokeWidth="0" pointerEvents="none">
        {payload.name} ({payload.value})
      </text>
    </g>
  );
};

export default SankeyNode;