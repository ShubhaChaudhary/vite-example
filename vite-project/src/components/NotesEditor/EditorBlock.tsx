import { Transition } from '@headlessui/react';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Path, Range } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlateStatic
} from 'slate-react';
import tw from 'twin.macro';
import { MeetingAwareness } from '../../models/meeting';
import { NotesBlock } from '../../models/notes';
import { inMeetingState } from '../../state/embedded';
import { useMediaHelpers } from '../../state/media/helpers';
import { meetingStatusState } from '../../state/meetings';
import { momentPositionState } from '../../state/moments';
import { track } from '../../utils/analytics';
import EditorBlockMenu from './EditorBlockMenu';
import EditorTimestamp from './EditorTimestamp';

import { NotesEditor, CursorsUpdateEvent } from './withNotesEditor';

interface EditorBlockProps extends RenderElementProps {
  element: NotesBlock;
}

const EditorBlock: React.FC<EditorBlockProps> = ({
  element,
  attributes,
  children
}) => {
  const editor = useSlateStatic() as NotesEditor & ReactEditor;
  const cursor = editor.meetingCursor;
  const [meetingId] = cursor;
  const mediaHelpers = useMediaHelpers();
  const [hovering, setHovering] = useState(false);
  const [awareness, setAwareness] = useState<MeetingAwareness | undefined>();
  const onMouseEnter = useCallback(() => setHovering(true), []);
  const onMouseLeave = useCallback(() => setHovering(false), []);
  const readOnly = useReadOnly();

  const momentClientId = element.momentClientId as string | undefined;
  const momentId = element.momentId as string | undefined;
  const position = useRecoilValue(
    momentPositionState([momentId, momentClientId])
  );
  const isInMeetingEmbeddedApp = useRecoilValue(inMeetingState);

  const status = useRecoilValue(meetingStatusState(cursor));

  const showEditorTimestamp =
    status !== 'in-progress' && !isInMeetingEmbeddedApp;

  const skip = useCallback(() => {
    if (!position) {
      return;
    }

    mediaHelpers.jump(cursor, position, 'notes-timestamp', false);
    track('meeting.notes.block.timestamp_clicked', {
      meetingId,
      blockId: element.id,
      blockType: element.type
    });
  }, [element.id, element.type, position]);

  useEffect(() => {
    let lastAwareness: MeetingAwareness | undefined = awareness;
    const path = ReactEditor.findPath(editor, element);
    const onUpdate = (event?: CursorsUpdateEvent) => {
      if (!event) {
        return;
      }

      const cursor = event.cursors.find((range) =>
        Path.isChild(Range.start(range).path, path)
      );

      const data = cursor?.data as MeetingAwareness | undefined;

      if (lastAwareness?.email === data?.email) {
        return;
      }

      lastAwareness = data;
      setAwareness(data);
    };

    editor.cursors.on('update', onUpdate);

    return () => {
      editor.cursors.off('update', onUpdate);
    };
  }, [element]);

  return (
    <div
      className={'group'}
      css={tw`relative flex items-start justify-between -ml-6 -mr-6 pl-6 pr-6 py-1 hover:bg-gray-100 dark:hover:bg-dark-3`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...attributes}
    >
      {children}

      {showEditorTimestamp && typeof position === 'number' && (
        <EditorTimestamp position={position} onClick={skip} />
      )}

      <Transition
        show={hovering && !readOnly && !editor.hideBlockMenu}
        as={Fragment}
        unmount
        enter="enter"
        enterFrom="enter-from"
        enterTo="enter-to"
        leave="leave"
        leaveFrom="leave-from"
        leaveTo="leave-to"
      >
        <EditorBlockMenu element={element} />
      </Transition>
    </div>
  );
};

export default EditorBlock;
