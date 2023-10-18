import {
  ArrowRight,
  Clock,
  DotsVertical,
  Play,
  Plus,
  Share,
  Trash
} from '@styled-icons/heroicons-solid';
import flatten from 'lodash/flatten';
import React, { useCallback, useMemo } from 'react';
import {
  useRecoilCallback,
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState
} from 'recoil';
import { v4 as uuid } from 'uuid';
import { Editor, Element, Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { NotesBlock } from '../../models/notes';
import {
  meetingBlockSelectorOpenState,
  meetingState
} from '../../state/meetings';
import { momentState } from '../../state/moments';
import ButtonGroup from '../ButtonGroup/ButtonGroup';
import CircularButton from '../CircularButton/CircularButton';
import Dropdown from '../Dropdown/Dropdown';
import DropdownButton from '../Dropdown/DropdownButton';
import DropdownItem from '../Dropdown/DropdownItem';
import DropdownMenu from '../Dropdown/DropdownMenu';
import DropdownSection from '../Dropdown/DropdownSection';
import { useMomentHelpers } from '../../state/moments/helpers';
import { mediaPositionState } from '../../state/media';
import { useMediaHelpers } from '../../state/media/helpers';
import { useModalHelpers } from '../../state/modals/helpers';
import { shareIntegrationsState } from '../../state/integrations';
import { handleError } from '../../utils/errors';
import { track } from '../../utils/analytics';
import { useBlockHelpers } from './useBlockHelpers';
import tw from 'twin.macro';
import styled from 'styled-components';
import Tooltip from '../Tooltip/Tooltip';
import { t } from 'i18next';
import { differenceInMilliseconds, parseISO } from 'date-fns';

const TransitionButtonGroup = styled(ButtonGroup)`
  &.enter {
    ${tw`transition ease-out duration-100`}
  }
  &.enter-from {
    ${tw`opacity-0`}
  }
  &.enter-to {
    ${tw`opacity-100`}
  }
  &.leave {
    ${tw`transition ease-in duration-75`}
  }
  &.leave-from {
    ${tw`opacity-100`}
  }
  &.leave-to {
    ${tw`opacity-0`}
  }
`;

interface EditorBlockMenuProps {
  element: NotesBlock;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  quick?: boolean;
  onClick: () => void;
}

const SettingsButton = styled(CircularButton)`
  ${tw`rounded-r-md -ml-px`}
`;

const EditorBlockMenu = React.forwardRef<HTMLSpanElement, EditorBlockMenuProps>(
  ({ element }, ref) => {
    const editor = useSlateStatic();
    const cursor = editor.meetingCursor;
    const [meetingId] = cursor;
    const meeting = useRecoilValue(meetingState(cursor));
    const integrationsLoadable = useRecoilValueLoadable(shareIntegrationsState);
    const integrations = integrationsLoadable.valueMaybe() || {};
    const modalHelpers = useModalHelpers();
    const mediaHelpers = useMediaHelpers();
    const hasMedia = !!meeting?.dubber_recording_id;

    const setSelectorOpen = useSetRecoilState(meetingBlockSelectorOpenState);
    const momentId = element.momentId as string | undefined;
    const momentClientId = element.momentClientId as string | undefined;
    const moment = useRecoilValue(momentState([momentId, momentClientId]));
    const hasTimestamp = typeof moment?.position === 'number';

    const blockHelpers = useBlockHelpers();
    const momentHelpers = useMomentHelpers();
    const addBlock = useCallback(() => {
      const path = ReactEditor.findPath(editor, element);
      const sectionEntry = Editor.above(editor, {
        at: path,
        match: (node) => Element.isElement(node) && node.type === 'section',
        mode: 'highest'
      });

      if (!sectionEntry) {
        return;
      }

      const [section, sectionPath] = sectionEntry;

      if (!Element.isElement(section)) {
        return;
      }

      const nextBlockPath = [...sectionPath, section.children.length];

      setSelectorOpen(true);
      Transforms.insertNodes(
        editor,
        {
          type: 'text',
          id: uuid(),
          children: [{ text: '' }]
        },
        { at: nextBlockPath, select: true }
      );
      track('meeting.notes.block_menu.added_below', {
        meetingId,
        blockId: element.id,
        blockType: element
      });
    }, [meetingId, element]);

    const deleteBlock = useCallback(async () => {
      const path = ReactEditor.findPath(editor, element);
      const [block, blockPath] = Editor.node(editor, path);

      track('meeting.notes.block_menu.deleted', {
        meetingId,
        blockId: element.id,
        blockType: element.type
      });

      // Headings are handle separately
      if (block.type === 'heading') {
        const sectionEntry = Editor.above(editor, {
          at: blockPath,
          match: (node) => Element.isElement(node) && node.type === 'section'
        });

        if (!sectionEntry) {
          return;
        }

        const [sectionNode, sectionPath] = sectionEntry;

        if (!Element.isElement(sectionNode)) {
          return;
        }

        const firstSection = sectionPath[0] === 0;
        const onlyChild = sectionNode.children.length === 1;
        const nextSection = Editor.next(editor, { at: sectionPath });

        Transforms.removeNodes(editor, { at: blockPath });

        if (firstSection && onlyChild && nextSection) {
          Transforms.removeNodes(editor, { at: sectionPath });
        }

        return;
      }

      Transforms.removeNodes(editor, { at: blockPath });

      const momentClientId = block.momentClientId as string | undefined;
      const momentId = block.momentId as string | undefined;

      if (!momentId && !momentClientId) {
        return;
      }

      try {
        await momentHelpers.destroy(cursor, [momentId, momentClientId]);
      } catch (err: any) {
        handleError(err);
      }
    }, [meetingId, element]);

    const playTimestamp = useCallback(() => {
      if (!moment) {
        return;
      }

      mediaHelpers.jump(cursor, moment.position!, 'notes-play');
      track('meeting.notes.block_menu.timestamp_played', {
        meetingId,
        blockId: element.id,
        blockType: element.type
      });
    }, [meetingId, element, moment]);

    const skipTimestamp = useCallback(() => {
      if (!moment) {
        return;
      }

      mediaHelpers.jump(cursor, moment.position!, 'notes-skip', false);
      track('meeting.notes.block_menu.timestamp_skipped', {
        meetingId,
        blockId: element.id,
        blockType: element.type
      });
    }, [meetingId, element, moment]);

    const shareBlock = useCallback(
      async (integration: string, integrationId: string) => {
        try {
          const moment = await blockHelpers.prepareBlockMoment(cursor, element);

          modalHelpers.openModal('shareMoment', {
            integration,
            integrationId,
            momentId: moment.encoded_id
          });

          track('meeting.notes.block_menu.share', {
            meetingId,
            blockId: element.id,
            blockType: element.type
          });
        } catch (err: any) {
          handleError(err);
        }
      },
      [meetingId, element]
    );

    const removeTimestamp = useCallback(async () => {
      try {
        const moment = await blockHelpers.prepareBlockMoment(cursor, element);

        await momentHelpers.update(
          cursor,
          [moment.encoded_id, moment.client_id],
          {
            position: null
          }
        );

        track('meeting.notes.block_menu.timestamp_removed', {
          meetingId,
          blockId: element.id,
          blockType: element.type
        });
      } catch (err: any) {
        handleError(err);
      }
    }, [meetingId, element]);

    const addCurrentTimestamp = useRecoilCallback(
      ({ snapshot }) =>
        async () => {
          const startedAtString =
            meeting?.started_at || meeting?.scheduled_start_at;
          const startedAt = startedAtString
            ? parseISO(startedAtString)
            : undefined;

          const mediaPosition = await snapshot.getPromise(
            mediaPositionState(cursor)
          );
          const position = Math.floor(
            meeting?.status === 'in-progress' && startedAt
              ? Math.max(0, differenceInMilliseconds(new Date(), startedAt))
              : hasMedia
              ? mediaPosition || 0
              : 0
          );

          try {
            const moment = await blockHelpers.prepareBlockMoment(
              cursor,
              element,
              {
                position
              }
            );

            await momentHelpers.update(
              cursor,
              [moment.encoded_id, moment.client_id],
              { position }
            );
            track('meeting.notes.block_menu.timestamp_added', {
              meetingId,
              blockId: element.id,
              blockType: element.type
            });
          } catch (err: any) {
            handleError(err);
          }
        },
      [
        cursor,
        element,
        meeting.status,
        meeting.started_at,
        meeting.scheduled_start_at
      ]
    );

    const menuItems: MenuItem[][] = useMemo(
      () =>
        [
          hasMedia &&
            hasTimestamp && [
              {
                label: t('meetings:notes_play_timestamp'),
                icon: <Play css={tw`w-4 h-4`} />,
                quick: true,
                onClick: playTimestamp
              },
              {
                label: t('meetings:notes_skip_timestamp'),
                icon: <ArrowRight css={tw`w-4 h-4`} />,
                onClick: skipTimestamp
              }
            ],
          (((element.type === 'text' || element.type === 'action') &&
            hasMedia) ||
            meeting.status === 'in-progress') &&
            (hasTimestamp
              ? [
                  {
                    label: t('meetings:notes_add_current_timestamp'),
                    icon: <Clock css={tw`w-4 h-4`} />,
                    onClick: addCurrentTimestamp
                  },
                  {
                    label: t('meetings:notes_remove_timestamp'),
                    icon: <Clock css={tw`w-4 h-4`} />,
                    onClick: removeTimestamp
                  }
                ]
              : [
                  {
                    label: t('meetings:notes_add_current_timestamp'),
                    icon: <Clock css={tw`w-4 h-4`} />,
                    onClick: addCurrentTimestamp
                  }
                ]),
          [
            {
              label: t('meetings:notes_add_block_below'),
              icon: <Plus css={tw`w-4 h-4`} />,
              quick: true,
              onClick: addBlock
            },
            integrations.asana && {
              label: t('meetings:notes_share_to', { provider: 'Asana' }),
              icon: <Share css={tw`w-4 h-4`} />,
              quick: Object.keys(integrations).length === 1,
              onClick: () => shareBlock('asana', integrations.asana.id)
            },
            integrations.jira && {
              label: t('meetings:notes_share_to', { provider: 'Jira Cloud' }),
              icon: <Share css={tw`w-4 h-4`} />,
              quick: Object.keys(integrations).length === 1,
              onClick: () => shareBlock('jira', integrations.jira.id)
            },
            integrations.slack && {
              label: t('meetings:notes_share_to', { provider: 'Slack' }),
              icon: <Share css={tw`w-4 h-4`} />,
              quick: Object.keys(integrations).length === 1,
              onClick: () => shareBlock('slack', integrations.slack.id)
            }
          ].filter(Boolean),
          [
            {
              label: t('meetings:notes_delete_block'),
              icon: <Trash css={tw`w-4 h-4`} />,
              quick: true,
              onClick: deleteBlock
            }
          ]
        ].filter(Boolean) as MenuItem[][],
      [t, hasMedia, hasTimestamp, meeting.status, element, integrations.slack]
    );

    const quickMenuItems = useMemo(
      () => flatten(menuItems).filter(({ quick }) => quick),
      [menuItems]
    );

    return (
      <Dropdown
        css={tw`select-none absolute right-0 top-1 z-10 transform translate-x-1 -translate-y-full`}
        contentEditable={false}
      >
        {({ open, referenceElement, setReferenceElement }) => (
          <>
            <TransitionButtonGroup ref={ref}>
              {quickMenuItems.map(({ label, icon, onClick }, i) => (
                <Tooltip key={label} text={label}>
                  <CircularButton
                    type={'ghost'}
                    size={'xs'}
                    rounded={false}
                    focus={'border'}
                    onClick={(event) => {
                      event.stopPropagation();
                      onClick();
                    }}
                    css={[i === 0 && tw`rounded-l-md`, i !== 0 && tw`-ml-px`]}
                    testId={'Share Moment - Share Button'}
                  >
                    {icon}
                  </CircularButton>
                </Tooltip>
              ))}

              <DropdownButton
                as={SettingsButton}
                ref={setReferenceElement}
                type={'ghost'}
                size={'xs'}
                rounded={false}
                focus={'border'}
                onClick={() =>
                  track('meeting.notes.block_menu.toggled', {
                    meetingId,
                    blockId: element.id,
                    blockType: element.type
                  })
                }
                data-testid={'Share Moment - Dropdown Button'}
              >
                <DotsVertical css={tw`w-4 h-4`} />
              </DropdownButton>
            </TransitionButtonGroup>

            <DropdownMenu
              referenceElement={referenceElement}
              open={open}
              placement={'bottom-end'}
              flipPadding={50}
            >
              {menuItems.map((section, i) => (
                <DropdownSection key={i}>
                  {section.map(({ icon, label, onClick }) => (
                    <DropdownItem key={label} onClick={onClick}>
                      {icon}
                      <span>{label}</span>
                    </DropdownItem>
                  ))}
                </DropdownSection>
              ))}
            </DropdownMenu>
          </>
        )}
      </Dropdown>
    );
  }
);

export default EditorBlockMenu;