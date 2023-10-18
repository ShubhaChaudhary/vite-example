import React, { useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import Block from '../Block';
import Button from '../../../../../components/Button/Button';
import { useRecoilValue } from 'recoil';
import { MeetingCursor, meetingState } from '../../../../../state/meetings';
import { useModalHelpers } from '../../../../../state/modals/helpers';
import { useFeature } from '../../../../../state/currentUser/helpers';
import { useQuery } from '../../../../../utils/hooks';
import NotesEditor from '../../../../../components/NotesEditor/NotesEditor';
import {
  meetingMomentsState,
  meetingSuggestedMomentsState
} from '../../../../../state/moments';
import { useMomentHelpers } from '../../../../../state/moments/helpers';
import { notesReadOnlyState } from '../../../../../state/notes';
import tw from 'twin.macro';
import { meetingAbilityState } from '../../../../../state/abilities';
import { subject } from '@casl/ability';
import { useTranslation } from 'react-i18next';

interface Props {
  cursor: MeetingCursor;
  className?: string;
}

const Notes: React.FC<Props> = ({ cursor, className }) => {
  const { t } = useTranslation();

  const query = useQuery();
  const ability = useRecoilValue(meetingAbilityState(cursor));
  const meeting = useRecoilValue(meetingState(cursor));
  const meetingSubject = useMemo(
    () => subject('Meeting', { ...meeting }),
    [ability]
  );
  const meetingMoments = useRecoilValue(meetingMomentsState(cursor));

  const momentHelpers = useMomentHelpers();
  const aiMetadataFeature = useFeature('ai_metadata');
  const suggestedNotesAutoOpenedRef = useRef(false);
  const notesReadOnly = useRecoilValue(notesReadOnlyState(cursor));
  const modalHelpers = useModalHelpers();

  useEffect(() => {
    if (!meetingMoments.length) {
      return;
    }

    momentHelpers.normalize(meetingMoments);
  }, [cursor]);

  const suggestedMoments = useRecoilValue(meetingSuggestedMomentsState(cursor));
  const suggestedMomentsCount = suggestedMoments.length;

  const hasSuggestions =
    meeting.has_suggested_comments || suggestedMomentsCount > 0;

  const suggestionLabel =
    hasSuggestions && !aiMetadataFeature.enabled
      ? t('meetings:notiv_notetaker_limit_suggestions')
      : t(
          suggestedMomentsCount > 1
            ? 'meetings:notiv_notetaker_suggestions_plural'
            : 'meetings:notiv_notetaker_suggestions',
          {
            count: suggestedMomentsCount
          }
        );

  useEffect(() => {
    if (
      suggestedNotesAutoOpenedRef.current ||
      !aiMetadataFeature.enabled ||
      notesReadOnly ||
      ability.cannot('edit', meetingSubject) ||
      !meeting.has_suggested_comments ||
      typeof query.review === 'undefined'
    ) {
      return;
    }

    modalHelpers.openModal(
      'suggestedMoments',
      {},
      { meetingId: cursor[0], source: 'auto-open' }
    );
    suggestedNotesAutoOpenedRef.current = true;
  }, [
    cursor,
    meeting.has_suggested_comments,
    aiMetadataFeature.enabled,
    notesReadOnly,
    ability,
    meetingSubject
  ]);

  return (
    <Block className={className}>
      <div
        css={[tw`bg-white dark:bg-dark-6 border-b rounded`]}
        data-testid={'Meeting Notes - Container'}
      >
        {ability.can('edit', meetingSubject) &&
          hasSuggestions &&
          !notesReadOnly && (
            <SuggestionContainer>
              <SuggestionLabel>{suggestionLabel}</SuggestionLabel>
              <Button
                type={'primary'}
                size={'sm'}
                onClick={() =>
                  modalHelpers.openModal(
                    'suggestedMoments',
                    { cursor },
                    { meetingId: cursor[0], source: 'review-button' }
                  )
                }
                testId={'Meeting Notes - Review Button'}
              >
                {t('review')}
              </Button>
            </SuggestionContainer>
          )}

        <div css={tw`dark:text-white dark:p-2`}>
          <NotesEditor
            cursor={cursor}
            readOnly={ability.cannot('edit', meetingSubject)}
          />
        </div>
      </div>
    </Block>
  );
};

export default Notes;

//----- Styles -----

const SuggestionContainer = styled.div`
  width: 100%;
  padding: 15px 20px;
  display: flex;
  flex-direction: row;
  background-color: rgba(33, 150, 83, 0.05);
  justify-content: space-between;
  align-items: center;
  ${tw`dark:bg-gray-100 rounded-t-md`}
`;

const SuggestionLabel = styled.span`
  color: #219653;
  font-size: 14px;
  font-weight: 500;
  ${tw`dark:text-green-600`}
`;
