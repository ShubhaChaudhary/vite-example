import { Transition } from '@headlessui/react';
import { Plus } from '@styled-icons/heroicons-solid';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useRecoilState } from 'recoil';
import { v4 as uuid } from 'uuid';
import { Editor, Element, Node, Path, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { meetingBlockSelectorOpenState } from '../../state/meetings';
import BlockSelectorItem from './BlockSelectorItem';
import useSlashRange from './useSlashRange';
import { usePopper } from 'react-popper';
import { track } from '../../utils/analytics';
import { NotesEditor } from './withNotesEditor';
import tw from 'twin.macro';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { handleError } from '../../utils/errors';

const Container = styled.div`
  ${tw`flex flex-col mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none`}
  &.enter {
    ${tw`transition ease-out duration-100`}
  }
  &.enter-from {
    ${tw`transform opacity-0 scale-95`}
  }
  &.enter-to {
    ${tw`transform opacity-100 scale-100`}
  }
  &.leave {
    ${tw`transition ease-in duration-75`}
  }
  &.leave-from {
    ${tw`transform opacity-100 scale-100`}
  }
  &.leave-to {
    ${tw`transform opacity-0 scale-95`}
  }
`;

const BlockSelector = () => {
  const { t } = useTranslation();
  const editor = useSlate() as ReactEditor & NotesEditor;
  const selection = editor.selection;
  const cursor = editor.meetingCursor;
  const [meetingId] = cursor;
  const animatedOpenRef = useRef(false);
  const [referenceElement, setReferenceElement] = useState<
    HTMLElement | undefined
  >();
  const [popperElement, setPopperElement] = useState<
    HTMLDivElement | undefined
  >();
  const {
    styles: popperStyles,
    attributes: popperAttributes,
    update: updatePopper
  } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start'
  });

  const blocks = useMemo(
    () => [
      {
        type: 'text',
        label: t('meetings:notes_text')
      },
      {
        type: 'actions',
        label: t('glossary:actions')
      },
      {
        type: 'section',
        label: t('meetings:notes_section')
      }
    ],
    [t]
  );

  const [activeIndex, setActiveIndex] = useState<number | undefined>(0);
  const [open, setOpen] = useRecoilState(meetingBlockSelectorOpenState);
  const slashRange = useSlashRange();
  const slashText = useMemo(
    () => (slashRange ? Editor.string(editor, slashRange).substr(1) : ''),
    [slashRange]
  );
  const matchingBlocks = useMemo(
    () =>
      blocks.filter(
        ({ type }) =>
          !slashText || type.toLowerCase().includes(slashText.toLowerCase())
      ),
    [blocks, slashText]
  );

  const chooseBlock = useCallback(
    (type: string) => {
      setOpen(false);

      if (!selection) {
        return;
      }

      if (slashRange) {
        Transforms.delete(editor, {
          at: slashRange
        });
      }

      // We force focus since clicking on the block selector may have removed focus
      ReactEditor.focus(editor);
      track('meeting.notes.block_selector.selected', {
        meetingId,
        blockType: type
      });

      const [blockNode, blockPath] = Editor.node(editor, selection, {
        depth: 2
      });
      const blockText = Node.string(blockNode);
      const isBlockEmpty = !blockText || blockText.startsWith('/');
      const replaceBlock =
        Element.isElement(blockNode) &&
        blockNode.type === 'text' &&
        isBlockEmpty;

      const nodeUpdate = {
        type,
        children:
          type === 'section'
            ? [
                {
                  type: 'heading',
                  children: [{ text: '' }]
                },
                {
                  type: 'text',
                  children: [{ text: '' }]
                }
              ]
            : [{ text: '' }]
      };

      // Handle sections manually, as we never replace
      // block nodes and we insert at the section level instead of block level.
      if (type === 'section') {
        if (replaceBlock) {
          Transforms.removeNodes(editor, { at: blockPath });
        }

        const sectionPath = Path.next(Path.parent(blockPath));

        Transforms.insertNodes(
          editor,
          { ...nodeUpdate, id: uuid() },
          {
            at: sectionPath
          }
        );

        return Transforms.select(editor, [...sectionPath, 0]);
      }

      // Replace the current block if it's empty text, otherwise insert a node after the current block.
      if (replaceBlock) {
        Transforms.setNodes(
          editor,
          { ...nodeUpdate, id: blockNode.id || uuid() },
          { at: blockPath }
        );
      } else {
        Transforms.insertNodes(
          editor,
          { ...nodeUpdate, id: uuid() },
          {
            at: Path.next(blockPath),
            select: true
          }
        );
      }
    },
    [selection]
  );

  // All accessibility keybinds for the block selector are handled here.
  // Keybinds for opening/closing the selector are handled by the `useEditorKeybinds` hook.
  useEffect(() => {
    if (!open || !popperElement) {
      return;
    }

    const activeBlock =
      typeof activeIndex !== 'undefined' && matchingBlocks[activeIndex];

    // Keybinds are based on: https://headlessui.dev/react/menu#keyboard-interaction
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'ArrowDown') {
        event.preventDefault();

        return setActiveIndex(
          Math.min(
            typeof activeIndex === 'undefined' ? 0 : activeIndex + 1,
            matchingBlocks.length - 1
          )
        );
      }

      if (event.code === 'ArrowUp') {
        event.preventDefault();

        return setActiveIndex(
          Math.max(typeof activeIndex === 'undefined' ? 0 : activeIndex - 1, 0)
        );
      }

      if ((event.code === 'Space' || event.code === 'Enter') && activeBlock) {
        event.preventDefault();

        return chooseBlock(activeBlock.type);
      }
    };

    // Close the selector when it's clicked outside of.
    const onClick = (event: MouseEvent) => {
      if (
        !animatedOpenRef.current ||
        popperElement.contains(event.target as HTMLElement)
      ) {
        return;
      }

      setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('click', onClick);
    };
  }, [open, activeIndex, matchingBlocks, popperElement]);

  // Based on https://github.com/ianstormtaylor/slate/blob/main/site/examples/hovering-toolbar.tsx
  useEffect(() => {
    if (!open || !selection) {
      return;
    }

    const [node] = Editor.node(editor, selection);
    const FIND_SELECTION_NODE_DELAY_MS = 100;
    const timeout = setTimeout(() => {
      try {
        setReferenceElement(ReactEditor.toDOMNode(editor, node));
      } catch (err: any) {
        handleError(err);
      }
    }, FIND_SELECTION_NODE_DELAY_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [open, selection]);

  // Reset the active item when the selector closes.
  useEffect(() => {
    if (open) {
      return track('meeting.notes.block_selector.opened', {
        meetingId
      });
    }

    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (updatePopper && referenceElement) {
      updatePopper();
    }
  }, [updatePopper, referenceElement]);

  return (
    <div
      css={tw`z-50`}
      ref={(elem) => elem && setPopperElement(elem)}
      style={popperStyles.popper}
      {...popperAttributes}
    >
      <Transition
        show={open}
        as={Fragment}
        enter="enter"
        enterFrom="enter-from"
        enterTo="enter-to"
        leave="leave"
        leaveFrom="leave-from"
        leaveTo="leave-to"
        afterEnter={() => (animatedOpenRef.current = true)}
        afterLeave={() => (animatedOpenRef.current = false)}
      >
        <Container>
          <div
            css={tw`px-4 pt-3 pb-2 text-xs font-bold uppercase dark:text-black`}
          >
            {t('meetings:notes_add_block')}
          </div>

          {matchingBlocks.map((block, i) =>
            block.type === 'section' ? (
              <button
                key={block.type}
                type={'button'}
                className={'group'}
                css={[
                  activeIndex === i
                    ? tw`bg-gray-300 text-gray-900`
                    : tw`bg-gray-200 text-gray-700`,
                  tw`flex items-center px-4 py-2 text-sm font-medium font-bold`
                ]}
                onClick={() => chooseBlock('section')}
              >
                <Plus css={tw`mr-1 w-3 h-3`} aria-hidden={'true'} />
                {t('meetings:notes_new_section')}
              </button>
            ) : (
              <BlockSelectorItem
                key={block.type}
                active={i === activeIndex}
                onClick={() => chooseBlock(block.type)}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {block.label}
              </BlockSelectorItem>
            )
          )}

          {!matchingBlocks.length && (
            <div css={tw`text-gray-900 px-4 py-2 text-sm font-medium`}>
              {t('meetings:notes_no_blocks_found')}
            </div>
          )}
        </Container>
      </Transition>
    </div>
  );
};

export default BlockSelector;