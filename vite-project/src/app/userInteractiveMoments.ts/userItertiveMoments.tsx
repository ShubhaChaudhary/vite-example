import { useEffect } from 'react';
import { RealtimeMessage } from '../../../models/realtimeMessaging';
import { useFeature } from '../../../state/currentUser';
import { MeetingCursor } from '../../../state/meetings';
import { useNoteHelpers } from '../../../state/notes/helpers';
import { useNotificationHelpers } from '../../../state/notifications/helpers';
import { realtimeEvents } from '../../../state/realtimeMessaging';

const useInteractiveMoments = (cursor: MeetingCursor) => {
  const notificationHelpers = useNotificationHelpers();
  const noteHelpers = useNoteHelpers();
  const interactiveMomentsFeature = useFeature('interactive_moments');

  useEffect(() => {
    if (!interactiveMomentsFeature.enabled) {
      return;
    }

    const onPublish = (data?: RealtimeMessage) => {
      if (!data || data.event_type !== 'moment.suggested') {
        return;
      }

      const moment = data.event_data;

      if (data.entity_id !== cursor[0]) {
        return;
      }

      notificationHelpers.show({
        type: 'primary',
        icon: 'sparkles',
        title: 'An action was mentioned!',
        description: `"${moment.body}"`,
        confirmLabel: 'Create Action',
        onConfirm: async () => {
          noteHelpers.insertMoment(cursor, moment);
        }
      });
    };

    realtimeEvents.on('publish', onPublish);

    return () => {
      realtimeEvents.off('publish', onPublish);
    };
  }, [cursor]);
};

export default useInteractiveMoments;