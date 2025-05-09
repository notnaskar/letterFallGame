import React from 'react';
import './NextTiles.css';

const NextTiles = ({ nextTiles }) => {
  // Make sure we're only showing the first 3 tiles
  const tilesToShow = nextTiles.slice(0, 3);
  
  return (
    <div className="next-tiles-container">
      <span>Upcoming Tiles</span>
      <div className="next-tiles-preview">
        {tilesToShow.map((tile, index) => (
          <div key={index} className="next-tile">
            {tile}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextTiles;