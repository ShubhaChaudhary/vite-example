import React, { useMemo } from 'react';
import tw from 'twin.macro';
import { formatTime } from '../../utils/time';

interface EditorTimestampProps {
  position: number;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const EditorTimestamp = React.memo<EditorTimestampProps>(
  ({ position, onClick }) => {
    const time = useMemo(() => formatTime(position), [position]);

    return (
      <a
        css={tw`select-none ml-2 p-1 bg-gray-100 cursor-pointer hover:underline hover:text-gray-900 group-hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-sm`}
        contentEditable={false}
        onClick={onClick}
      >
        {parseInt(time.h, 10) > 0 && time.h + ':'}
        {time.m}:{time.s}
      </a>
    );
  }
);

export default EditorTimestamp;