import { track } from './analytics';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@notiv.com';
export const contactSupport = ({
  source,
  message = '',
  meetingId
}: {
  source: string;
  message?: string;
  meetingId?: string;
}) => {
  const Intercom = (window as any).Intercom;

  track('help.support_contacted', {
    source,
    meetingId
  });

  if (typeof Intercom === 'undefined') {
    return window.open(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(message)}`
    );
  }

  Intercom('showNewMessage', message);
};