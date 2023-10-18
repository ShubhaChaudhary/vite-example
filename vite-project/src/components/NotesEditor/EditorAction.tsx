import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Node } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlateStatic
} from 'slate-react';
import { Contact } from '../../common/types/contacts';
import { MomentType } from '../../models/meeting';
import { NotesActionBlock } from '../../models/notes';
import { meetingMomentTypesByTitleState } from '../../state/meetings';
import { momentState } from '../../state/moments';
import { useMomentHelpers } from '../../state/moments/helpers';
import { useNotificationHelpers } from '../../state/notifications/helpers';
import { handleError } from '../../utils/errors';
import Action from '../Action/Action';
import EditorBlock from './EditorBlock';
import { useBlockHelpers } from './useBlockHelpers';
import { NotesEditor } from './withNotesEditor';

interface EditorActionProps extends RenderElementProps {
  element: NotesActionBlock;
}

const EditorAction: React.FC<EditorActionProps> = ({
  element,
  attributes,
  children
}) => {
  const { t } = useTranslation();
  const editor = useSlateStatic() as ReactEditor & NotesEditor;
  const readOnly = useReadOnly();
  const cursor = editor.meetingCursor;
  const momentId = element.momentId as string | undefined;
  const momentClientId = element.momentClientId as string | undefined;
  const moment = useRecoilValue(momentState([momentId, momentClientId]));
  const momentTypes = useRecoilValue(meetingMomentTypesByTitleState(cursor));
  const actionMomentType: MomentType | undefined = momentTypes['Action'];
  const momentHelpers = useMomentHelpers();
  const blockHelpers = useBlockHelpers();
  const notificationHelpers = useNotificationHelpers();
  const showPlaceholder = useMemo(() => !Node.string(element), [element]);
  const placeholder = element.placeholder ? element.placeholder : undefined;

  // Don't allow editing of an action that has a client ID that we haven't seen
  // or that is read only.
  // A missing client ID means it's being created by someone else.
  const disabled = (!!momentClientId && !moment) || readOnly;

  const toggleComplete = useCallback(async () => {
    try {
      const targetMoment = await blockHelpers.prepareBlockMoment(
        cursor,
        element,
        { moment_type_id: actionMomentType?.encoded_id }
      );

      await momentHelpers.setComplete(
        cursor,
        [targetMoment.encoded_id, targetMoment.client_id],
        !targetMoment.task?.complete
      );
    } catch (err: any) {
      handleError(err);
    }
  }, [element]);

  const assignUser = useCallback(
    async (user: Contact | undefined) => {
      try {
        const targetMoment = await blockHelpers.prepareBlockMoment(
          cursor,
          element,
          { moment_type_id: actionMomentType?.encoded_id }
        );
        await momentHelpers.assignUser(
          cursor,
          [targetMoment.encoded_id, targetMoment.client_id],
          user?.id === targetMoment?.task?.assignee?.id ? undefined : user
        );
      } catch (err: any) {
        handleError(err);

        notificationHelpers.show({
          type: 'error',
          icon: 'exclamation-circle',
          title: t('validation:something_went_wrong'),
          description: t('meetings:unexpected_error_assigning'),
          confirmLabel: t('retry'),
          closeLabel: t('dismiss'),
          onConfirm: () => assignUser(user)
        });
      }
    },
    [element]
  );

  return (
    <EditorBlock element={element} attributes={attributes}>
      <Action
        placeholder={showPlaceholder ? placeholder : ''}
        disabled={disabled}
        assignee={moment?.task?.assignee}
        complete={moment?.task?.complete}
        onChangeAssignee={(user) => assignUser(user)}
        onChangeComplete={() => toggleComplete()}
      >
        {children}
      </Action>
    </EditorBlock>
  );
};

export default EditorAction;