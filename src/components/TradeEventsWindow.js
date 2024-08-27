import React from 'react';

const TradeEventsWindow = ({ tradeEvents }) => {
  return (
    <div
      className="trade-events-window bg-indigo-900 text-white rounded-lg p-4 overflow-y-auto"
      style={{ maxHeight: '400px', width: '100%' }}
    >
      <h2 className="text-xl font-bold mb-2">Trade Events</h2>
      {tradeEvents.length === 0 ? (
        <p>No trade events yet.</p>
      ) : (
        tradeEvents.map((event, index) => (
          <p key={index} className="mb-1">
            {event}
          </p>
        ))
      )}
    </div>
  );
};

export default TradeEventsWindow;