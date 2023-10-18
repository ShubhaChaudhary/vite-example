import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Slate, Editable, ReactEditor } from 'slate-react';
import { Scrubber } from 'slate';
import styled from 'styled-components';
import tw from 'twin.macro';
import EditorLeaf, { EditorLeafProps } from './EditorLeaf';
import EditorElement, { EditorElementProps } from './EditorElement';
import EditorEmptyState from './EditorEmptyState';
import EditorFormatMenu from './EditorFormatMenu';
import TemplateMenu from './TemplateMenu';
import TemplateModal from '../../modals/TemplateModal/TemplateModal';
import {
  meetingCollaborateTokenState,
  meetingNotesHasContentState,
  meetingShowTemplateOverlayState,
  MeetingCursor,
  meetingState
} from '../../state/meetings';
import isEqual from 'lodash/isEqual';
import useCollabEditor from './useCollabEditor';
import useEditorKeybinds from './useEditorKeybinds';
import BlockSelector from './BlockSelector';
import useMomentsListener from './useMomentsListener';
import { useRecoilValue } from 'recoil';
import Alert from '../Alert/Alert';
import { useNoteHelpers } from '../../state/notes/helpers';
import { track } from '../../utils/analytics';
import { useFeature } from '../../state/currentUser/helpers';
import Spinner from '../Spinner/Spinner';
import useMemoizedDecorate from './useMemoizedDecorate';
import { useTranslation } from 'react-i18next';

interface NotesEditorProps {
  cursor: MeetingCursor;
  readOnly?: boolean;
  hideAwareness?: boolean;
  hideBlockMenu?: boolean;
  fill?: boolean;
}

const EditorWrap = styled.div`
  min-height: 24rem;
  max-width: 1067px;
  ${tw`dark:min-h-[5rem]`}
  ${tw`relative`}
`;

const NotesEditor: React.FC<NotesEditorProps> = ({
  cursor,
  readOnly,
  hideAwareness,
  hideBlockMenu,
  fill
}) => {
  const [isRemounted, setRemountState] = useState(false);
  const token = useRecoilValue(meetingCollaborateTokenState(cursor));
  const lastTokenRef = useRef(token);

  useEffect(() => {
    if (lastTokenRef.current === token) {
      return;
    }

    lastTokenRef.current = token;
    setRemountState(true);
    const remountTimeout = setTimeout(setRemountState, 50, false);

    return () => {
      clearTimeout(remountTimeout);
    };
  }, [token]);

  return isRemounted ? null : (
    <NotesEditorInternal
      token={token}
      cursor={cursor}
      readOnly={readOnly}
      hideAwareness={hideAwareness}
      hideBlockMenu={hideBlockMenu}
      fill={fill}
    />
  );
};

interface NotesEditorInternalProps {
  token: string | false;
  cursor: MeetingCursor;
  hideBlockMenu?: boolean;
  hideAwareness?: boolean;
  fill?: boolean;
  readOnly?: boolean;
}

const NotesEditorInternal: React.FC<NotesEditorInternalProps> = ({
  token,
  cursor,
  readOnly,
  hideAwareness,
  hideBlockMenu,
  fill
}) => {
  const { t } = useTranslation();
  const meeting = useRecoilValue(meetingState(cursor));
  const noteHelpers = useNoteHelpers();
  const parentRef = useRef<HTMLDivElement>(null);
  const {
    editor,
    provider,
    online,
    connecting,
    connectionAttempts,
    value,
    setValue
  } = useCollabEditor({
    token,
    cursor,
    initialValue: meeting.notes || [],
    initialState: meeting.notes_state || '',
    hideAwareness,
    hideBlockMenu
  });

  const hasContent = useRecoilValue(meetingNotesHasContentState(cursor));
  const showTemplateOverlay = useRecoilValue(
    meetingShowTemplateOverlayState(cursor)
  );
  const notesTemplates = useFeature('notes_templates');

  const { decorate } = useMemoizedDecorate(editor);
  const renderLeaf = useCallback(
    (props: EditorLeafProps) => <EditorLeaf {...props} />,
    [decorate]
  );
  const renderElement = useCallback(
    (props: EditorElementProps) => <EditorElement {...props} />,
    []
  );

  const onFocus = useCallback(() => {
    track('meeting.notes.focused', { meetingId: cursor[0] });
  }, []);

  const onInput = useCallback(() => {
    // Reconcile the editor state with the pending changes on every input event.
    const pendingDiffs = ReactEditor.androidPendingDiffs(editor);
    const scheduleFlush = pendingDiffs ? pendingDiffs.length > 0 : false;

    if (scheduleFlush) {
      ReactEditor.androidScheduleFlush(editor);
    }
  }, [editor]);

  const disabled = !online && connectionAttempts >= 3;

  useEffect(() => {
    noteHelpers.updateReadOnly(cursor, readOnly || disabled);

    if (readOnly || disabled) {
      ReactEditor.blur(editor);
    }
  }, [readOnly, disabled]);

  useEffect(() => {
    if (!provider?.awareness) {
      return;
    }

    let lastAwareness: { name: string; email: string }[] | undefined;
    const onChange = () => {
      const newAwareness = Array.from(
        provider.awareness.getStates().values()
      ).map(({ name, email }) => ({ name, email })) as {
        name: string;
        email: string;
      }[];

      if (lastAwareness && isEqual(newAwareness, lastAwareness)) {
        return;
      }

      lastAwareness = newAwareness;
      noteHelpers.updateAwareness(cursor, newAwareness);
    };

    provider.awareness.on('change', onChange);

    return () => {
      provider.awareness.off('change', onChange);
    };
  }, [provider]);

  return (
    <div ref={parentRef} css={tw`relative`}>
      {!online && !readOnly && connectionAttempts >= 3 && (
        <Alert
          type={'error'}
          css={[
            !fill && tw`-ml-6 -mr-6 rounded-b-none`,
            fill && tw`-ml-1 -mr-12 rounded-none`,
            tw`text-xs mb-2`
          ]}
        >
          {t('meetings:notes_lost_connection')}
        </Alert>
      )}

      {connecting && !value.length && (
        <div css={tw`flex items-center justify-center p-6`}>
          <Spinner css={tw`w-12 h-12`} />
        </div>
      )}

      <EditorWrap>
        <Slate editor={editor} value={value} onChange={setValue}>
          <SyncedEditable
            cursor={cursor}
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            decorate={decorate}
            disabled={disabled}
            readOnly={readOnly || disabled}
            css={tw`space-y-4`}
            onFocus={onFocus}
            onInput={onInput}
          />

          {!hideBlockMenu && <BlockSelector />}
          <EditorFormatMenu parentRef={parentRef} />
          {notesTemplates.enabled &&
            !connecting &&
            !readOnly &&
            !hasContent && <EditorEmptyState />}

          {notesTemplates.enabled &&
            !connecting &&
            !readOnly &&
            !hasContent &&
            !showTemplateOverlay && <TemplateMenu />}

          {notesTemplates.enabled && <TemplateModal />}
        </Slate>
      </EditorWrap>
    </div>
  );
};

type SyncedEditableProps = Parameters<typeof Editable>[0] & {
  cursor: MeetingCursor;
};

const SyncedEditable: React.FC<SyncedEditableProps> = ({
  cursor,
  css,
  ...props
}) => {
  const { onKeyDown } = useEditorKeybinds(cursor);
  useMomentsListener(cursor);

  return <Editable css={css as any} {...props} onKeyDown={onKeyDown} />;
};

Scrubber.setScrubber((key, value) => {
  if (key === 'text') return '... scrubbed ...';

  return value;
});

export default NotesEditor;
