import React from 'react';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import CustomizedContent from '../../atoms/CustomizedContent';
import { CSVRow } from '../../../services/csvParser';

interface ProductTypesChartProps {
  rows: CSVRow[];
}

const ProductTypesChart: React.FC<ProductTypesChartProps> = ({ rows }) => {
  const productTypeData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const counts = rows.reduce((acc: { [key: string]: number }, trip) => {
      const product = trip.product_type || 'N/A';
      acc[product] = (acc[product] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, size]) => ({ name: `${name} (${size})`, size }));
  }, [rows]);

  const treemapColors = React.useMemo(() => ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'], []);
  const renderTreemapContent = React.useCallback((props: any) => <CustomizedContent {...props} colors={treemapColors} />, [treemapColors]);

  if (productTypeData.length === 0) return null;

  return (
    <div className="stats-group">
      <h3>Product Types</h3>
      <ResponsiveContainer width="100%" height={700}>
        <Treemap data={productTypeData} dataKey="size" ratio={4 / 3} stroke="#fff" fill="#8884d8" isAnimationActive={false} content={renderTreemapContent}>
          <Tooltip formatter={(value: number, name: string, props: any) => [props.payload.name.split(' (')[0], `Count: ${value}`]} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTypesChart;