import React from 'react';
import { Moment } from '../../models/meeting';
import Checkbox from '../Checkbox/Checkbox';
import tw from 'twin.macro';
import { isValid } from 'date-fns';
import { formatDate } from '../../common';
import { useRecoilValue } from 'recoil';
import { dateLocaleState } from '../../state/i18n/selectors';
import { currentTimezoneState } from '../../state/currentUser';
import Card from '../Card/Card';
import { parseISO } from 'date-fns';
import { useLocation } from 'react-router-dom';

interface Props {
  moment: Moment;
  maxLen?: number;
  onToggle: () => any;
}

const ActionItemCard: React.FC<Props> = ({ moment, onToggle }) => {
  const actionText = moment.body || moment.transcript || '';
  const createdAt = parseISO(moment.created_at);
  const timezone = useRecoilValue(currentTimezoneState);
  const dateLocale = useRecoilValue(dateLocaleState);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const microsoftAppId = searchParams.get('appId');

  const meetingDeeplink = (meetingId: string) => {
    const subEntityId = JSON.stringify({ meetingId: meetingId });

    const webUrl = encodeURI(
      `${window.location.origin}/meetings/${meetingId}?is=embedded&provider=msteams&appId=${microsoftAppId}`
    );
    const context = encodeURI(`{"subEntityId": "${window.btoa(subEntityId)}"}`);

    return `msteams://teams.microsoft.com/l/entity/${microsoftAppId}/recordings?webUrl=${webUrl}&context=${context}`;
  };

  return (
    <Card testId={'Actions - Card'}>
      <div css={tw`flex`}>
        <div css={tw`flex-none pt-1 pr-3`}>
          <Checkbox
            css={tw`w-4 h-4`}
            type={'alert'}
            value={(moment.task && moment.task.complete) || false}
            onChange={onToggle}
          />
        </div>

        <div css={tw`flex-1 max-w-full`}>
          <p css={tw`font-medium text-base max-w-full pb-2 align-top truncate`}>
            {actionText}
          </p>
          {isValid(createdAt) && (
            <p css={tw`text-gray-500`}>
              {formatDate(createdAt, `EEEE, PP 'at' p`, {
                timezone: timezone,
                locale: dateLocale
              })}
            </p>
          )}
          <a
            css={tw`text-blue-800`}
            href={meetingDeeplink(moment.meeting?.encoded_id!)}
            target={'_blank'}
            rel={'noreferrer'}
          >
            {moment.meeting?.title}
          </a>
        </div>
      </div>
    </Card>
  );
};

export default ActionItemCard;