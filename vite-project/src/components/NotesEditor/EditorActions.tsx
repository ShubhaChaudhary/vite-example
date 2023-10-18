import React, { Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { RenderElementProps, useSlateStatic } from 'slate-react';
import tw from 'twin.macro';
import { NotesActionsBlock } from '../../models/notes';
import { meetingAllSuggestedMomentsState } from '../../state/moments';
import { useFeature } from '../../state/currentUser';
import EditorSuggestedAction from './EditorSuggestedAction';
import { Transition } from '@headlessui/react';
import { meetingStatusState } from '../../state/meetings';

interface EditorActionsProps extends RenderElementProps {
  element: NotesActionsBlock;
}

const EditorActions: React.FC<EditorActionsProps> = ({
  element,
  attributes,
  children
}) => {
  const editor = useSlateStatic();
  const cursor = editor.meetingCursor;
  const suggestedMoments = useRecoilValue(
    meetingAllSuggestedMomentsState(cursor)
  );
  const aiMetadataFeature = useFeature('ai_metadata');
  const status = useRecoilValue(meetingStatusState(cursor));
  const animate = status === 'in-progress';

  return (
    <div css={tw`py-1`} {...attributes}>
      {children}

      {aiMetadataFeature.enabled && suggestedMoments.length > 0 && (
        <div contentEditable={false} css={tw`mt-2 space-y-2`}>
          {suggestedMoments.map((moment, i) => (
            <Transition
              key={i}
              as={Fragment}
              show={moment.accepted !== true && moment.accepted !== false}
              enter={'enter'}
              enterFrom={'enter-from'}
              enterTo={'enter-to'}
              entered={'entered'}
              leave={'leave'}
              leaveFrom={'leave-from'}
              leaveTo={'leave-to'}
            >
              <EditorSuggestedAction
                parentElement={element}
                moment={moment}
                animate={animate}
              />
            </Transition>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditorActions;