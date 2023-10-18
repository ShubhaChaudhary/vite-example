import React, { useState } from 'react';
import { Text } from 'slate';
import tw from 'twin.macro';
import { usePopper } from 'react-popper';
import { MeetingAwareness } from '../../models/meeting';

interface EditorCaretProps {
  leaf: Text & { isForward: boolean; data: MeetingAwareness | undefined };
}

const EditorCaret: React.FC<EditorCaretProps> = ({
  leaf: { data, isForward }
}) => {
  const playerNumber = data?.playerNumber;
  const name = data?.name;
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );

  const { styles, attributes, state } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: 'top-start'
    }
  );

  const placement = state?.placement || 'top-start';

  return (
    <span
      contentEditable={false}
      ref={setReferenceElement}
      style={styles.reference}
      css={[
        tw`absolute pointer-events-none select-none h-full w-0.5`,
        isForward ? tw`left-full bottom-0` : tw`left-0 top-0`,
        playerNumber === 1 && tw`bg-multiplayer-1`,
        playerNumber === 2 && tw`bg-multiplayer-2`,
        playerNumber === 3 && tw`bg-multiplayer-3`,
        playerNumber === 4 && tw`bg-multiplayer-4`,
        playerNumber === 5 && tw`bg-multiplayer-5`,
        playerNumber === 6 && tw`bg-multiplayer-6`,
        playerNumber === 7 && tw`bg-multiplayer-7`,
        playerNumber === 8 && tw`bg-multiplayer-8`,
        playerNumber === 9 && tw`bg-multiplayer-9`,
        playerNumber === 10 && tw`bg-multiplayer-10`
      ]}
      {...attributes.reference}
    >
      <span css={tw`relative bg-inherit`}>
        <span
          contentEditable={false}
          ref={setPopperElement}
          css={[
            placement === 'bottom-start' && tw`rounded-tr rounded-b z-[5]`,
            placement === 'bottom-end' && tw`rounded-tl rounded-b z-[5]`,
            placement === 'top-start' && tw`rounded-br rounded-t`,
            placement === 'top-end' && tw`rounded-bl rounded-t`,
            tw`pointer-events-none select-none whitespace-nowrap px-2 py-0.5 bg-inherit text-gray-900 font-medium text-xs`
          ]}
          style={styles.popper}
          {...attributes.popper}
        >
          {name}
        </span>
      </span>
    </span>
  );
};

export default EditorCaret;