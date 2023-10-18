import React, { useCallback, useMemo, useState } from 'react';
import { debounce, pick } from 'lodash';
import {
  useCurrentUserHelpers,
  useFeature
} from '../../../state/currentUser/helpers';
import { useRecoilValue } from 'recoil';
import { currentUserState } from '../../../state/currentUser';
import Toggle from '../../../components/Toggle/Toggle';
import styled from 'styled-components';
import tw from 'twin.macro';
import { handleError } from '../../../utils/errors';
import Card from '../../../components/Card/Card';
import { useTranslation } from 'react-i18next';

const SAVE_DEBOUNCE_MS = 1000;
const NotificationRow = styled.div`
  ${tw`flex flex-col space-y-2 lg:space-y-0 lg:space-x-2 lg:flex-row lg:items-center`}
`;

interface NotificationSetting {
  title: string;
  description: string;
  key:
    | 'notification_accepted'
    | 'notification_missing_data'
    | 'notification_reminder'
    | 'notification_processed'
    | 'notification_channels'
    | 'notification_digest'
    | 'notification_task';
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useRecoilValue(currentUserState);
  const currentUserHelpers = useCurrentUserHelpers();
  const channels2 = useFeature('channels2');

  const notifications: NotificationSetting[] = useMemo(
    () =>
      [
        {
          title: t('settings:notifications_calendar_invite_accepted'),
          description: t(
            'settings:notifications_calendar_invite_accepted_description'
          ),
          key: 'notification_accepted'
        },
        {
          title: t('settings:notifications_ready'),
          description: t('settings:notifications_ready_description'),
          key: 'notification_processed'
        },
        channels2.enabled && {
          title: t('settings:notifications_channel_updates'),
          description: t('settings:notifications_channel_updates_description'),
          key: 'notification_channels'
        },
        {
          title: t('settings:notifications_daily_digest'),
          description: t('settings:notifications_daily_digest_description'),
          key: 'notification_digest'
        },
        {
          title: t('settings:notifications_action_assignment'),
          description: t(
            'settings:notifications_action_assignment_description'
          ),
          key: 'notification_task'
        }
      ].filter((_) => _) as NotificationSetting[],
    [t]
  );

  const [value, setValue] = useState(
    pick(currentUser, [
      'notification_accepted',
      'notification_missing_data',
      'notification_reminder',
      'notification_processed',
      'notification_channels',
      'notification_digest',
      'notification_task'
    ])
  );

  const saveValue = useCallback(
    debounce(
      (data: any) => currentUserHelpers.update(data).catch(handleError),
      SAVE_DEBOUNCE_MS
    ),
    []
  );

  const handleToggle = useCallback(
    (key: NotificationSetting['key']) => (toggled: boolean) => {
      const data = {
        ...value,

        [key]: toggled
      };

      setValue(data);
      saveValue(data);
    },
    [value]
  );

  return (
    <Card>
      <h3
        css={tw`text-2xl text-base-19 font-bold mb-1`}
        data-testid={'Account - Notifications - Heading'}
      >
        {t('nav:notifications')}
      </h3>
      <p css={tw`text-base text-base-12 mb-6`}>
        {t('settings:notifications_description')}
      </p>

      <div css={tw`space-y-6`}>
        {notifications.map(({ title, description, key }) => (
          <NotificationRow key={key}>
            <div css={tw`flex-1`}>
              <h4 css={tw`text-sm text-base-19 font-semibold mb-1`}>{title}</h4>
              <p css={tw`text-sm text-base-12`}>{description}</p>
            </div>

            <Toggle
              value={value[key]}
              onChange={handleToggle(key)}
              testId={'Account - Notifications - Toggle'}
            />
          </NotificationRow>
        ))}
      </div>
    </Card>
  );
};

export default NotificationsPage;