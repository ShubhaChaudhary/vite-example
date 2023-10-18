import React from 'react';
import tw from 'twin.macro';
import { Contact } from '../../common/types/contacts';
import { User } from '../../models/user';
import Assignee from '../Assignee/Assignee';
import Checkbox from '../Checkbox/Checkbox';

interface ActionProps {
  placeholder?: string;
  disabled?: boolean;
  complete?: boolean;
  assignee?: Contact;
  assigneeOptions?: User[];
  className?: string;
  children?: React.ReactNode;
  onChangeComplete?: (complete: boolean) => void;
  onChangeAssignee?: (assignee: Contact | undefined) => void;
}

const Action: React.FC<ActionProps> = ({
  placeholder,
  disabled,
  complete,
  assignee,
  className,
  onChangeComplete,
  onChangeAssignee,
  children
}) => {
  return (
    <div
      css={tw`flex flex-1 w-11/12 items-start space-x-2`}
      className={className}
      data-private={'lipsum'}
      data-testid={'Meeting - Action'}
    >
      <Checkbox
        type={'alert'}
        css={tw`mt-1 w-4 h-4 flex-none`}
        disabled={disabled}
        value={complete}
        contentEditable={false}
        onChange={onChangeComplete}
      />

      <Assignee
        css={tw`mt-0.5 flex-none`}
        disabled={disabled}
        assignee={assignee}
        contentEditable={false}
        onUserSelect={onChangeAssignee}
      />

      {placeholder && (
        <span
          contentEditable={false}
          css={tw`absolute left-16 opacity-25 pointer-events-none select-none`}
        >
          {placeholder}
        </span>
      )}

      <p css={tw`break-words w-11/12 text-black dark:text-white`}>{children}</p>
    </div>
  );
};

export default Action;
