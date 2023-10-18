import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import Sidebar from './sidebar/Sidebar';
import Notes from './blocks/notes/Notes';
import InMeeting from './InMeeting/InMeeting';
import { useRouteMatch } from 'react-router-dom';
import {
  MeetingCursor,
  meetingRequestIdState,
  meetingShowLiteExperienceState,
  meetingShowTransportState,
  meetingState
} from '../../../state/meetings';
import { ErrorBoundary } from 'react-error-boundary';
import MeetingError from './errors/MeetingError';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { modalOpenState } from '../../../state/modals';
import { useModalHelpers } from '../../../state/modals/helpers';
import tw from 'twin.macro';
import { useMeetingHelpers } from '../../../state/meetings/helpers';
import { authLoggedInState } from '../../../state/auth';
import {
  embeddedShowBreadcrumbsState,
  inMeetingState,
  removeMeetingState
} from '../../../state/embedded';

import MeetingMasthead from '../../../components/MeetingMasthead/MeetingMasthead';
import { setupMeetingMessaging } from '../../../state/realtimeMessaging';
import { handleError } from '../../../utils/errors';
import HighlightsBlock from './blocks/highlights/HighlightsBlock';
import { currentUserShowLiteExperienceState } from '../../../state/currentUser';
import { useFeature } from '../../../state/currentUser/helpers';
import PlayerControls from './blocks/media/player/PlayerControls';
import styled from 'styled-components';
import LiteUpsell from './sidebar/LiteUpsell';
import TranscribedLiteNotice from './sidebar/TranscribedLiteNotice';
import { ChevronLeft } from '@styled-icons/heroicons-solid';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useMeetingPolling from './useMeetingPolling';
import { observeMetric } from '../../../instrumentation';
import useInteractiveMoments from './useInteractiveMoments';
import RemoveMeeting from './RemoveMeeting';
import ChapterPanel from './sidebar/ChapterPanel';

interface MeetingParams {
  meetingId: string;
  secretKey?: string;
}

const MeetingContent: React.FC<MeetingParams> = ({ meetingId, secretKey }) => {
  const startRecordingFeature = useFeature('start_recording');
  const chaptersPanelFeature = useFeature('chapters_panel');
  const initialMountTimeRef = useRef(Date.now());
  const showUserLite = useRecoilValue(currentUserShowLiteExperienceState);
  const showMeetingLite = useRecoilValue(
    meetingShowLiteExperienceState([meetingId, secretKey])
  );
  const modalHelpers = useModalHelpers();
  const meetingHelpers = useMeetingHelpers();
  const isInMeetingEmbeddedApp = useRecoilValue(inMeetingState);
  const isRemoveMeetingEmbeddedApp = useRecoilValue(removeMeetingState);
  const showBreadcrumbs = useRecoilValue(embeddedShowBreadcrumbsState);
  const { t } = useTranslation();

  const cursor: MeetingCursor = useMemo(
    () => [meetingId, secretKey],
    [meetingId, secretKey]
  );

  const setRequestId = useSetRecoilState(meetingRequestIdState(cursor));
  const showTransport = useRecoilValue(meetingShowTransportState(cursor));
  const meeting = useRecoilValue(meetingState(cursor));

  const ContentWrapper = styled.div<{
    showTransport: boolean;
  }>`
    ${tw`flex flex-1 flex-col lg:pb-0 lg:flex-row lg:overflow-auto`}
    ${({ showTransport }) => (showTransport ? tw`pb-[87px]` : '')}
  `;

  // Setup the Centrifugo connection for non-authed users.
  const setupMessaging = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const meeting = await snapshot.getPromise(meetingState(cursor));
        return setupMeetingMessaging(
          meeting.updates_token,
          meeting.updates_channel
        );
      },
    [cursor]
  );

  const trackViewed = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const isLoggedIn = await snapshot.getPromise(authLoggedInState);

        // We can't track if the user is anonymous or if they're viewing a public version.
        if (!isLoggedIn || cursor[1]) {
          return;
        }

        meetingHelpers.trackEvent(cursor, 'viewed');
      },
    [cursor]
  );

  const closeSuggestedNotes = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const open = await snapshot.getPromise(
          modalOpenState('suggestedMoments')
        );

        if (open) {
          modalHelpers.closeModal('suggestedMoments', { meetingId: cursor[0] });
        }
      },
    [cursor]
  );

  useMeetingPolling(cursor);
  useInteractiveMoments(cursor);

  useEffect(() => {
    if (
      startRecordingFeature.enabled &&
      meeting.status === 'scheduled' &&
      isInMeetingEmbeddedApp
    ) {
      meetingHelpers.startRecording(cursor);
    }
  }, [meeting]);

  useEffect(() => {
    let cleanupMessaging: (() => void) | undefined;

    setupMessaging()
      .then((cleanup) => {
        cleanupMessaging = cleanup;
      })
      .catch(handleError);

    trackViewed();

    return () => {
      // Close the action items modal when navigating away
      closeSuggestedNotes();

      // Force the meeting to reload next time it's viewed
      setRequestId((rid) => rid + 1);

      if (cleanupMessaging) {
        cleanupMessaging();
      }
    };
  }, [cursor]);

  useEffect(() => {
    observeMetric(
      'web_meeting_load_time_duration_seconds',
      (Date.now() - initialMountTimeRef.current) / 1000
    );
  }, []);

  return isInMeetingEmbeddedApp ? (
    <InMeeting cursor={cursor} />
  ) : isRemoveMeetingEmbeddedApp ? (
    <RemoveMeeting cursor={cursor} />
  ) : (
    <div css={tw`flex flex-col h-full`}>
      <MeetingMasthead cursor={cursor} />

      <ContentWrapper showTransport={showTransport}>
        <div css={tw`w-full relative flex flex-none lg:flex-1`}>
          <div
            css={tw`w-full flex flex-col items-center overflow-auto bg-white`}
          >
            <div css={tw`lg:hidden w-full`}>
              {!showUserLite && showMeetingLite && (
                <TranscribedLiteNotice cursor={cursor} />
              )}
              {showUserLite && <LiteUpsell />}
            </div>
            {showBreadcrumbs && (
              <div css={tw`w-full pl-3 lg:px-6 mt-4`}>
                <Link
                  css={tw`flex justify-start text-primary-500 font-bold`}
                  to={`/recordings`}
                >
                  <ChevronLeft css={tw`w-5 h-5 font-semibold`} />
                  <p>{t('meetings:all_meetings')}</p>
                </Link>
              </div>
            )}
            {chaptersPanelFeature.enabled && (
              <div css={tw`lg:hidden w-full`}>
                <ChapterPanel cursor={cursor} />
              </div>
            )}
            <Notes
              cursor={cursor}
              css={[showBreadcrumbs ? tw`mt-4` : tw`mt-8`]}
            />
            {!showUserLite && !showMeetingLite && (
              <HighlightsBlock cursor={cursor} />
            )}
          </div>
        </div>

        <Sidebar cursor={cursor} />
      </ContentWrapper>
      {showTransport && (
        <ErrorBoundary fallbackRender={() => null}>
          <Suspense>
            <div
              css={tw`flex flex-col items-stretch bg-white shadow-sm border-t fixed lg:static w-full bottom-0 z-20`}
            >
              <PlayerControls cursor={cursor} />
            </div>
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
};

export const Meeting = () => {
  const {
    params: { meetingId, secretKey }
  } = useRouteMatch<MeetingParams>();
  return (
    <ErrorBoundary FallbackComponent={MeetingError}>
      <MeetingContent meetingId={meetingId} secretKey={secretKey} />
    </ErrorBoundary>
  );
};

export default Meeting;