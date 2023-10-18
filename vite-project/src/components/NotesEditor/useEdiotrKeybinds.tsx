import { KeyboardEvent, useCallback, useMemo } from 'react';
import isHotKey from 'is-hotkey';
import { Editor, Element, Path, Text, Transforms } from 'slate';
import { useSlateStatic } from 'slate-react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { v4 as uuid } from 'uuid';
import {
  MeetingCursor,
  meetingBlockSelectorOpenState,
  meetingState
} from '../../state/meetings';
import { useBlockHelpers, useDefaultActionAssignee } from './useBlockHelpers';
import { calculateSlashRange } from './useSlashRange';
import once from 'lodash/once';
import { track } from '../../utils/analytics';
import { throttle } from 'lodash';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { handleError } from '../../utils/errors';

const isFormatActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: 'all'
  });
  return !!match;
};

const useEditorKeybinds = (cursor: MeetingCursor) => {
  const editor = useSlateStatic();
  const blockHelpers = useBlockHelpers();

  const meeting = useRecoilValue(meetingState(cursor));
  const assignActionToSelf = useDefaultActionAssignee(cursor);

  const trackKeyDownOnce = useCallback(
    once(() => {
      track('meeting.notes.key_pressed', {
        meetingId: cursor[0]
      });
    }),
    []
  );

  const openSelector = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const open = snapshot
          .getLoadable(meetingBlockSelectorOpenState)
          .getValue();

        if (!open) {
          set(meetingBlockSelectorOpenState, true);
        }
      },
    []
  );

  const closeSelector = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const open = snapshot
          .getLoadable(meetingBlockSelectorOpenState)
          .getValue();

        if (open) {
          set(meetingBlockSelectorOpenState, false);
        }
      },
    []
  );

  const onBackspace = useCallback(() => {
    const selection = editor.selection;

    if (!selection) {
      return;
    }

    const slashRange = calculateSlashRange(editor, selection);

    if (!slashRange) {
      return;
    }

    const slashText = Editor.string(editor, slashRange);

    if (!slashText || slashText === '/') {
      closeSelector();
    }
  }, []);

  const onModEnter = useCallback((event: KeyboardEvent) => {
    if (!editor.selection) {
      return;
    }

    const entry = Editor.above(editor, {
      at: editor.selection,
      match: (node) => Element.isElement(node) && node.type === 'section'
    });

    if (!entry) {
      return;
    }

    const [, sectionPath] = entry;
    const nextSectionPath = Path.next(sectionPath);
    const headingPath = [...nextSectionPath, 0];

    event.preventDefault();
    Transforms.insertNodes(
      editor,
      {
        type: 'section',
        id: uuid(),
        children: [
          {
            type: 'heading',
            id: uuid(),
            children: [
              {
                text: ''
              }
            ]
          },
          {
            type: 'text',
            id: uuid(),
            children: [
              {
                text: ''
              }
            ]
          }
        ]
      },
      { at: nextSectionPath }
    );

    Transforms.select(editor, headingPath);
  }, []);

  const onShiftEnter = useCallback((event: KeyboardEvent) => {
    event.preventDefault();
    Transforms.insertText(editor, '\n');
  }, []);

  const getSelectedBlock = () => {
    const blockEntry = Editor.above(editor, {
      at: editor.selection,
      mode: 'lowest',
      match: (node) => Element.isElement(node)
    });

    return blockEntry;
  };

  const onEnter = useRecoilCallback(
    ({ snapshot }) =>
      (event: KeyboardEvent) => {
        const selectorOpen =
          snapshot.getLoadable(meetingBlockSelectorOpenState).valueMaybe() ||
          false;

        if (!editor.selection || selectorOpen) {
          return;
        }

        const blockEntry = getSelectedBlock();

        if (!blockEntry) return;

        const [block, blockPath] = blockEntry;

        if (!Element.isElement(block)) {
          return;
        }

        if (block.type === 'action') {
          event.preventDefault();

          const isEmpty = Editor.isEmpty(editor, block);

          if (!isEmpty) {
            Transforms.splitNodes(editor, {
              at: editor.selection,
              always: true
            });
            Transforms.unsetNodes(editor, ['momentId', 'momentClientId']);

            return;
          }

          const pathRef = Editor.pathRef(editor, blockPath);

          Transforms.splitNodes(editor, { at: pathRef.current! });
          Transforms.liftNodes(editor, { at: pathRef.current! });
          Transforms.setNodes(
            editor,
            { type: 'text' },
            { at: pathRef.current! }
          );

          pathRef.unref();
        }
      },
    []
  );

  const TIMESTAMP_DEBOUNCE_MS = 1000;
  const onOther = useCallback(
    throttle(() => {
      if (!editor.selection) {
        return;
      }

      const startedAtString = meeting.started_at || meeting.scheduled_start_at;
      const startedAt = startedAtString ? parseISO(startedAtString) : undefined;
      const blockEntry = getSelectedBlock();

      if (!blockEntry) return;

      const [block] = blockEntry;

      if (
        !Element.isElement(block) ||
        (block.type !== 'action' && block.type !== 'text') ||
        block.momentClientId
      ) {
        return;
      }

      if (meeting.status !== 'in-progress' || !startedAt) {
        return;
      }

      blockHelpers.prepareBlockMoment(cursor, block, {
        position: Math.max(0, differenceInMilliseconds(new Date(), startedAt))
      });
    }, TIMESTAMP_DEBOUNCE_MS),
    [meeting.status, meeting.started_at, meeting.scheduled_start_at]
  );

  const assignAction = useCallback(
    throttle(() => {
      if (!editor.selection) {
        return;
      }
      const blockEntry = getSelectedBlock();
      if (!blockEntry) return;

      const [block] = blockEntry;
      if (Element.isElement(block) && block.type === 'action') {
        assignActionToSelf(block).catch((err: any) => handleError(err));
      }
    }, TIMESTAMP_DEBOUNCE_MS),
    []
  );

  const toggleFormatting = useCallback(
    (format: 'bold' | 'italic') => (event: KeyboardEvent<HTMLDivElement>) => {
      if (!editor.selection) {
        return;
      }

      event.preventDefault();

      Transforms.setNodes(
        editor,
        { [format]: isFormatActive(editor, format) ? null : true },
        { match: Text.isText, split: true }
      );
    },
    []
  );

  const hotkeys = useMemo(
    () => ({
      '/': openSelector,
      escape: closeSelector,
      backspace: onBackspace,
      enter: onEnter,
      'shift+enter': onShiftEnter,
      'mod+enter': onModEnter,
      'mod+b': toggleFormatting('bold'),
      'mod+i': toggleFormatting('italic')
    }),
    [
      openSelector,
      closeSelector,
      onBackspace,
      onEnter,
      onShiftEnter,
      onModEnter,
      toggleFormatting
    ]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      trackKeyDownOnce();

      for (const [hotkey, cb] of Object.entries(hotkeys)) {
        if (!isHotKey(hotkey, event.nativeEvent)) {
          continue;
        }

        cb(event);
        return;
      }

      /**
       * https://javascript.info/keyboard-events#mobile-keyboards
       * https://stackoverflow.com/questions/68065687/keyboard-event-event-key-is-unidentified-on-android-webview
       * to cover the android issue
       */
      const isAndroidMobileKeybordEvent =
        /Android/i.test(navigator.userAgent) && event.key == 'Unidentified';

      if (isAndroidMobileKeybordEvent || event.nativeEvent.key.match(/^\w$/)) {
        onOther();
        assignAction();
      }
    },
    [hotkeys, trackKeyDownOnce, onOther]
  );

  return { onKeyDown };
};

export default useEditorKeybinds;