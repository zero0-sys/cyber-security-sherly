import React from 'react';
import GlobalThreatsMap from './GlobalThreats/GlobalThreatsMap';
import 'leaflet/dist/leaflet.css';

const WorldMap: React.FC = () => {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <GlobalThreatsMap />
    </div>
  );
};

export default WorldMap;
