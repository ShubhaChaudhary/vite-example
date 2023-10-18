import KafkaProducer from '../kafka/KafkaProducer';
import { MeetingEvent } from '../kafka/models/dubber_meeting_event';
import { Msteams_MeetingEvent_EventName } from '../kafka/models/msteams_event';
import { logger } from '../lib/logger';

export const removeTab = async (
  meetingId: string,
  tenantId: string,
  userId: string,
  instanceId: string
) => {
  const meetingEvent: MeetingEvent = {
    msteams: {
      meeting_event: {
        event_name: Msteams_MeetingEvent_EventName['ON_TAB_REMOVED'],
        tab_event_data: {
          id: meetingId,
          tenant_id: tenantId,
          user_id: userId,
          instance_id: instanceId
        }
      }
    }
  };

  logger.info(`Removing tab for meeting with id: ${meetingId}`);
  const kafkaProducer = KafkaProducer.getInstance();

  await kafkaProducer.publishToKafka(meetingId, meetingEvent);
};