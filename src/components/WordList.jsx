import React from 'react';
import './WordList.css';

const WordList = ({ words }) => {
  return (
    <div className="word-list">
      <h3>Words Found (4+ letters)</h3>
      <div className="word-list-container">
        {words.length === 0 ? (
          <p className="no-words">No words found yet</p>
        ) : (
          <ul>
            {words.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WordList;