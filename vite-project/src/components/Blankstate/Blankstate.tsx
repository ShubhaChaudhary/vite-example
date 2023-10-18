import React from 'react';
import Text from '../Text/Text';
import Image from '../Image/Image';
import { Heading3 } from '../Heading/Heading';
import tw from 'twin.macro';

interface Props {
  image?: string;
  heading?: string;
  body?: string;
  testId?: string;
  children?: React.ReactNode;
}

const BlankState: React.FC<Props> = ({
  image,
  heading,
  body,
  testId,
  children
}) => (
  <div css={tw`text-center max-w-sm m-auto`} data-testid={testId}>
    {image && <Image src={image} m="auto" mb={5} />}
    {heading && <Heading3 mb={3}>{heading}</Heading3>}
    {body && <Text>{body}</Text>}
    {children}
  </div>
);

export default BlankState;