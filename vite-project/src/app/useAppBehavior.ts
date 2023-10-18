import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilCallback, useRecoilValueLoadable } from 'recoil';
import { RealtimeMessage } from '../models/realtimeMessaging';
import { currentUserOptionalState } from '../state/currentUser';
import { useCurrentUserHelpers } from '../state/currentUser/helpers';
import { useNotificationHelpers } from '../state/notifications/helpers';
import { plansState } from '../state/plans';
import { refreshConnection, realtimeEvents } from '../state/realtimeMessaging';
import { teamOptionalState } from '../state/team';

const useAppBehaviour = () => {
  const { t } = useTranslation();
  const notificationHelpers = useNotificationHelpers();
  const currentUserHelpers = useCurrentUserHelpers();
  const userLoadable = useRecoilValueLoadable(currentUserOptionalState);
  const user = userLoadable.valueMaybe();

  // Preload data in the background, to reduce waterfall requests from suspense.
  const preloadData = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        try {
          await Promise.all([
            snapshot.getPromise(currentUserOptionalState),
            snapshot.getPromise(teamOptionalState),
            snapshot.getPromise(plansState)
          ]);
        } catch (err: any) {
          // Do nothing. This will be handled elsewhere.
        }
      },
    []
  );

  useEffect(() => {
    preloadData();
  }, []);

  // Identify the user with analytics/error tools whenever the user changes.
  useEffect(() => {
    if (!user) {
      return;
    }

    let cleanupMessaging: (() => void) | undefined;
    currentUserHelpers
      .identifyUser()
      .then((cleanup) => (cleanupMessaging = cleanup));

    return () => {
      if (cleanupMessaging) {
        cleanupMessaging();
      }
    };
  }, [user?.encoded_id]);

  // Only show the Intercom launcher when the user manually choses to contact support.
  useEffect(() => {
    const Intercom = (window as any).Intercom;

    if (typeof Intercom === 'undefined') {
      return;
    }

    Intercom('update', { hide_default_launcher: true });
  }, []);

  // Handle offline state and tab visibility changes.
  useEffect(() => {
    let notificationId: string | undefined;

    const onOnline = () => {
      refreshConnection();

      if (notificationId) {
        notificationHelpers.close(notificationId);

        notificationId = notificationHelpers.show(
          {
            icon: 'status-online',
            type: 'success',
            title: t('online'),
            description: t('validation:your_network_is_back'),
            closeLabel: t('dismiss')
          },
          {
            closeAfter: 30000
          }
        );
      }
    };

    const onOffline = () => {
      if (notificationId) {
        notificationHelpers.close(notificationId);
      }

      notificationId = notificationHelpers.show(
        {
          icon: 'status-offline',
          type: 'error',
          title: t('offline'),
          description: t('validation:your_network_is_unavailable')
        },
        {
          closeable: false
        }
      );
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        return;
      }

      // Ensure that the realtime messaging connection is alive when the tab is re-focused.
      refreshConnection();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Handle notification for new web-app version
  useEffect(() => {
    const onPublish = (msg?: RealtimeMessage) => {
      if (msg?.event_type !== 'app.updated') {
        return;
      }

      // handle new message coming from channel "app"
      notificationHelpers.show({
        type: 'info',
        icon: 'information-circle',
        title: t('settings:app_update_available'),
        description: t('settings:new_version_available'),
        confirmLabel: t('refresh'),
        onConfirm: () => {
          window.location.reload();
        }
      });
    };

    realtimeEvents.on('publish', onPublish);

    return () => {
      realtimeEvents.off('publish', onPublish);
    };
  }, []);

  refreshConnection();
};

export default useAppBehaviour;