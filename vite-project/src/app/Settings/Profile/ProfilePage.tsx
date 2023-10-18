import React, { useState } from 'react';
import ProfileForm from './ProfileForm';
import { currentUserState } from '../../../state/currentUser';
import { useCurrentUserHelpers } from '../../../state/currentUser/helpers';
import { useRecoilValue } from 'recoil';
import { User } from '../../../models/user';
import { handleError } from '../../../utils/errors';
import Card from '../../../components/Card/Card';
import tw from 'twin.macro';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const currentUser = useRecoilValue(currentUserState);
  const currentUserHelpers = useCurrentUserHelpers();

  const onSave = async (data: Partial<User>) => {
    setSaving(true);

    try {
      await currentUserHelpers.update(data);
    } catch (err: any) {
      handleError(err);
    }

    setSaving(false);
  };

  return (
    <div css={tw`space-y-6`}>
      <Card>
        <h3
          css={tw`text-2xl text-base-19 font-bold mb-1`}
          data-testid={'Account - Profile - Heading'}
        >
          {t('settings:your_profile')}
        </h3>
        <p css={tw`text-base text-base-12 mb-4`}>
          {t('settings:your_profile_description')}
        </p>

        <ProfileForm
          onSave={onSave}
          currentUser={currentUser}
          loading={saving}
        />
      </Card>
    </div>
  );
};

export default ProfilePage;
