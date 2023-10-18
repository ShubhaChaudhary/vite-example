import { Check, X } from '@styled-icons/heroicons-outline';
import { Sparkles } from '@styled-icons/heroicons-solid';
import React from 'react';
import { ReactEditor, useSlateStatic } from 'slate-react';
import tw from 'twin.macro';
import { Contact, Moment, NotesActionsBlock } from '../../common';
import { currentUserState, useFeature } from '../../state/currentUser';
import Tooltip from '../Tooltip/Tooltip';
import { v4 as uuid } from 'uuid';
import { handleError } from '../../utils/errors';
import { Transforms } from 'slate';
import { useMomentHelpers } from '../../state/moments/helpers';
import { useRecoilValue } from 'recoil';
import { formatTime } from '../../utils/time';
import styled, { css, keyframes } from 'styled-components';

const enteredLightAnimation = keyframes`
  0% {
    background: linear-gradient(white, white) padding-box, linear-gradient(to right, #D1D5DB, #6B7280) border-box;
    border: 1px solid transparent;
  }
  33.33% {
    background: linear-gradient(white, white) padding-box, linear-gradient(to left, #D1D5DB, #6B7280) border-box;
  }
  66.66% {
    background: linear-gradient(white, white) padding-box, linear-gradient(to left, #D1D5DB, #6B7280) border-box;
  }
  100% {
    ${tw`border-gray-300 dark:border-gray-600 dark:hover:bg-neutral-800 dark:hover:border-gray-400 hover:bg-gray-50 hover:border-gray-400`}
  }
`;

const enteredDarkAnimation = keyframes`
  0% {
    background: linear-gradient(#262626, #262626) padding-box, linear-gradient(to right, #D1D5DB, #6B7280) border-box;
    border: 1px solid transparent;
  }
  33.33% {
    background: linear-gradient(#262626, #262626) padding-box, linear-gradient(to left, #D1D5DB, #6B7280) border-box;
  }
#D1D5DB
  66.66% {
    background: linear-gradient(#262626, #262626) padding-box, linear-gradient(to left, #D1D5DB, #6B7280) border-box;
  }
  100% {
    ${tw`border-gray-300 dark:border-gray-600 dark:hover:bg-neutral-800 dark:hover:border-gray-400 hover:bg-gray-50 hover:border-gray-400`}
  }
`;

const EditorSuggestedActionContainer = styled.div<{ animate?: boolean }>`
  ${tw`flex flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 transition-all ease-out duration-[120ms] dark:hover:bg-neutral-800 dark:hover:border-gray-400 hover:bg-gray-50 hover:border-gray-400`}
  ${({ animate }) =>
    !animate
      ? ''
      : css`
          &.enter-from {
            ${tw`opacity-0 h-0 overflow-hidden`}
          }
          &.enter-to {
            ${tw`opacity-100 h-9 overflow-visible`}
          }
          &.entered {
            animation: ${enteredLightAnimation} 900ms linear forwards;
          }
          .dark &.entered {
            animation: ${enteredDarkAnimation} 900ms linear forwards;
          }
        `}
  &.leave-from {
    ${tw`opacity-100 h-9 overflow-visible`}
  }
  &.leave-to {
    ${tw`opacity-0 h-0 overflow-hidden`}
  }
`;

interface EditorSuggestedActionProps {
  parentElement: NotesActionsBlock;
  moment: Moment;
  animate?: boolean;
}

const EditorSuggestedAction = React.forwardRef<
  HTMLDivElement,
  EditorSuggestedActionProps
>(({ parentElement, moment, animate }, ref) => {
  const editor = useSlateStatic();
  const cursor = editor.meetingCursor;
  const aiMomentSummaryFeature = useFeature('ai_moment_summary');
  const currentUser = useRecoilValue(currentUserState);
  const momentHelpers = useMomentHelpers();
  const time = formatTime(moment.start_time || 0);
  const acceptAction = async ({
    encoded_id,
    client_id,
    transcript,
    summary,
    body
  }: Moment) => {
    try {
      const path = ReactEditor.findPath(editor, parentElement);

      Transforms.insertNodes(
        editor,
        [
          {
            type: 'action',
            id: uuid(),
            children: [
              {
                text:
                  (aiMomentSummaryFeature.enabled && summary
                    ? summary
                    : transcript) || body
              }
            ]
          }
        ],
        { at: [...path, parentElement.children.length], select: true }
      );

      await momentHelpers.update(cursor, [encoded_id, client_id], {
        accepted: true
      });

      await momentHelpers.assignUser(cursor, [encoded_id, client_id], {
        id: currentUser.encoded_id
      } as Contact);
    } catch (err: any) {
      handleError(err);
    }
  };

  const dismissAction = async ({ encoded_id, client_id }: Moment) => {
    try {
      await momentHelpers.update(cursor, [encoded_id, client_id], {
        accepted: false
      });
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <EditorSuggestedActionContainer
      key={moment.encoded_id}
      className={'group'}
      ref={ref}
      animate={animate}
    >
      <div css={tw`relative flex-1 flex flex-row items-center h-7`}>
        <Sparkles css={tw`shrink-0 w-4 h-4 text-[#FDD936] mr-1.5`} />

        <div
          css={tw`flex-1 text-xs leading-4 text-gray-500 dark:text-gray-400 group-hover:dark:text-gray-300 group-hover:text-gray-700`}
        >
          {(aiMomentSummaryFeature.enabled && moment.summary
            ? moment.summary
            : moment.transcript) || moment.body}
        </div>

        <div
          css={tw`flex flex-row space-x-px absolute -top-0.5 bottom-0 right-0 opacity-0 transition-all ease-out duration-[120ms] bg-[linear-gradient(270deg, #F9FAFB 79.51%, rgba(249, 250, 251, 0) 100%)] dark:bg-[linear-gradient(270deg, #262626 79.51%, rgba(38, 38, 38, 0) 100%)] group-hover:opacity-100 group-hover:right-2`}
        >
          <Tooltip css={tw`h-full`} text={'Accept'} delay={350} offset={[0, 0]}>
            <button
              type={'button'}
              css={tw`bg-transparent w-8 h-8 inline-flex items-center justify-center text-gray-400 transition-all ease-out duration-[120ms] hover:dark:text-gray-200 hover:text-gray-600`}
              onClick={() => acceptAction(moment)}
            >
              <Check css={tw`w-5 h-5`} />
            </button>
          </Tooltip>

          <Tooltip
            css={tw`h-full`}
            text={'Dismiss'}
            delay={350}
            offset={[0, 0]}
          >
            <button
              type={'button'}
              css={tw`bg-transparent w-8 h-8 inline-flex items-center justify-center text-gray-400 transition-all ease-out duration-[120ms] hover:dark:text-gray-200 hover:text-gray-600`}
              onClick={() => dismissAction(moment)}
            >
              <X css={tw`w-5 h-5`} />
            </button>
          </Tooltip>
        </div>
      </div>

      {typeof moment.start_time === 'number' && (
        <span
          css={tw`bg-gray-100 rounded-lg py-1 px-1.5 text-xs text-gray-600 tabular-nums dark:hidden`}
        >
          {(time.h as any) > 0 && time.h + ':'}
          {time.m}:{time.s}
        </span>
      )}
    </EditorSuggestedActionContainer>
  );
});

export default EditorSuggestedAction;