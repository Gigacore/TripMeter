import React from 'react';
import { Layer, Rectangle } from 'recharts';

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
  const isClickable = payload.name === 'Total Requests' || payload.value > 0;
  const handleClick = () => {
    if (!isClickable) return;
    const typeMap: { [key: string]: string } = {
      'Successful': 'successful-map',
      'Rider Canceled': 'rider_canceled-map',
      'Driver Canceled': 'driver_canceled-map',
      'Unfulfilled': 'unfulfilled-map',
      'Total Requests': 'all-map',
    };
    onShowTripList(typeMap[payload.name]);
  };

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} fill="#666" fillOpacity="1" onClick={handleClick} cursor={isClickable ? 'pointer' : 'default'} />
      <text textAnchor="middle" x={x + width / 2} y={y + height / 2} fontSize="14" fill="#fff" strokeWidth="0">
        {payload.name} ({payload.value})
      </text>
    </Layer>
  );
};

export default SankeyNode;