
import React from 'react';
import styled from 'styled-components';
import { playTime } from '../../../utils/numbers';
import tw from 'twin.macro';

interface Props {
  position: number;
}

const TimeMark: React.FC<Props & any> = (props) => {
  const { position, ...rest } = props;
  const displayTime = playTime(position);

  return (
    <TimeText
      css={tw`h-5`}
      mb={0}
      ml={2}
      fontSize={0}
      contentEditable={false}
      {...rest}
    >
      {displayTime}
    </TimeText>
  );
};

export default TimeMark;

//----- Styles -----
const TimeText = styled.span`
  ${tw`cursor-pointer text-base-12 hover:text-base-18 tabular-nums select-none`}
`;