import React from 'react';
import { IconRobot } from '@tabler/icons-react';

const ChatLoader = () => {
  return React.createElement(
    'div',
    {
      className: 'group border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100',
      style: { overflowWrap: 'anywhere' },
    },
    React.createElement(
      'div',
      {
        className: 'm-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl',
      },
      React.createElement(
        'div',
        {
          className: 'min-w-[40px] items-end',
        },
        React.createElement(IconRobot, { size: 30 })
      ),
      React.createElement(
        'span',
        {
          className: 'animate-pulse cursor-default mt-1',
        },
        '▍'
      )
    )
  );
};

export default ChatLoader;