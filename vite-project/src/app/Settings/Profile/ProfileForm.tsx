import axios from 'axios';
import React, { ChangeEvent, Fragment, useState } from 'react';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';
import tw from 'twin.macro';
import { useFeature } from '../../../state/currentUser/helpers';

import api from '../../../api';
import Label from '../../../components/Label/Label';

import Avatar from '../../../components/Avatar/Avatar';
import Button from '../../../components/Button/Button';
import Text from '../../../components/Text/Text';
import Spinner from '../../../components/Spinner/Spinner';
import TimeZoneDropdown from '../../../components/TimeZoneDropdown';
import timezones from '../../../utils/timezones.json';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getAccessToken } from '../../../state/auth';
import { localeState } from '../../../state/i18n';
import { useSetRecoilState } from 'recoil';
import { LocaleCode } from '../../../common/types/users';
import Input from '../../../components/Input/Input';
import SelectMenu from '../../../components/SelectMenu/SelectMenu';

interface Props extends WithTranslation {
  currentUser: any;
  loading: boolean;
  slim?: boolean;
  onSave: (data: any) => any;
}

interface UserProfileProps {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  time_zone: any;
  language: string;
  upload?: any;
  uploadProgress: number | null;
}

const AvatarButton = styled(Button)`
  position: absolute;
  right: 0;
  bottom: 0;
  transform: translate(30%, 30%);
  z-index: 11;
`;

const AvatarDrop = styled.div`
  cursor: pointer;
  outline: none;
  overflow: visible;
  position: relative;
`;

const BaseProfileForm: React.FC<Props> = ({
  currentUser: { first_name, last_name, language, time_zone, avatar_url },
  loading,
  slim,
  onSave,
  t
}) => {
  const languageSelection = useFeature('language_selection');
  const localTimeZone =
    timezones.find(
      (tz: any) => tz.zone == Intl.DateTimeFormat().resolvedOptions().timeZone
    ) || timezones[0];
  const defaultTimeZone = time_zone ? time_zone : localTimeZone.zone;

  const setLocale = useSetRecoilState(localeState);

  // Moving this to utils would be better, in future
  const languageOptions = [
    {
      label: t('settings:english_language'),
      value: 'en'
    },
    {
      label: t('settings:french_language'),
      value: 'fr'
    },
    {
      label: t('settings:german_language'),
      value: 'de'
    }
  ];

  const [userProfile, setCurrentUser] = useState<UserProfileProps>({
    firstName: first_name,
    lastName: last_name,
    time_zone: defaultTimeZone ? defaultTimeZone : null,
    language: language || 'en',
    avatarUrl: avatar_url,
    uploadProgress: null
  });

  const handleAvatarChange = async (files: any[]) => {
    if (files) {
      const upload = await api.uploads.createUpload(await getAccessToken());
      axios({
        url: upload.put,
        method: 'put',
        data: files[0],
        headers: { 'Content-Type': 'audio/*' },
        onUploadProgress: onUploadProgress
      }).then(() => {
        setCurrentUser({
          ...userProfile,
          avatarUrl: upload.get,
          upload: upload,
          uploadProgress: null
        });
      });
    }
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentUser({ ...userProfile, firstName: e.target.value });
  };

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentUser({ ...userProfile, lastName: e.target.value });
  };

  const handleTimezoneChange = (value: string) => {
    setCurrentUser({ ...userProfile, time_zone: value });
  };

  const handleLanguageChange = (value: string) => {
    setCurrentUser({ ...userProfile, language: value });
  };

  const handleSubmit = () => {
    const { firstName, lastName, time_zone, language } = userProfile;

    const userProps: any = {
      first_name: firstName,
      last_name: lastName,
      time_zone: time_zone,
      language
    };

    if (userProfile.upload)
      userProps.remote_avatar_url = userProfile.upload.get;

    setLocale(language as LocaleCode);
    onSave(userProps);
  };

  const onUploadProgress = (e: any) => {
    setCurrentUser({
      ...userProfile,
      uploadProgress: Math.round((e.loaded * 100) / e.total)
    });
  };

  return (
    <Fragment>
      {!slim && <Label mt={3}>{t('settings:avatar')}</Label>}
      <div css={tw`inline-block`}>
        <Dropzone accept={'image/*'} onDrop={handleAvatarChange}>
          {({ getRootProps, getInputProps }) => (
            <AvatarDrop {...getRootProps({})}>
              <input {...getInputProps()} />

              <Avatar
                css={tw`w-24 h-24`}
                name={[userProfile.firstName, userProfile.lastName].join(' ')}
                src={userProfile.avatarUrl}
              />

              {userProfile.uploadProgress !== null ? (
                <AvatarButton type={'ghost'} size={'xs'} disabled>
                  <Spinner css={tw`w-4 h-4`} />
                </AvatarButton>
              ) : (
                <AvatarButton type={'ghost'} size={'xs'}>
                  {t('edit')}
                </AvatarButton>
              )}
            </AvatarDrop>
          )}
        </Dropzone>
      </div>
      <Label mt={3}>{t('name')}</Label>
      {!slim && (
        <Text color="light" mt={-1}>
          {t('settings:name_description')}
        </Text>
      )}

      <div css={tw`flex mb-4`}>
        <div css={tw`w-1/2 mr-2`}>
          <Input
            css={tw`w-full`}
            name="user[first_name]"
            value={userProfile.firstName}
            onChange={handleFirstNameChange}
            placeholder={t('settings:first_name')}
          />
        </div>

        <div css={tw`w-1/2`}>
          <Input
            css={tw`w-full`}
            value={userProfile.lastName}
            onChange={handleLastNameChange}
            placeholder={t('settings:last_name')}
          />
        </div>
      </div>

      <Label>{t('settings:timezone')}</Label>
      {!slim && (
        <Text color="light" mt={-1}>
          {t('settings:timezone_description')}
        </Text>
      )}
      <TimeZoneDropdown
        timeZones={timezones}
        onChange={handleTimezoneChange}
        value={userProfile.time_zone}
      />

      {languageSelection.enabled && (
        <>
          <Label mt={3} data-testid={'Account - Profile - Language Label'}>
            {t('settings:set_language')}
          </Label>
          <SelectMenu
            css={tw`block w-full`}
            testId={'Account - Profile - Language Select'}
            onChange={handleLanguageChange}
            value={userProfile.language}
            options={languageOptions}
          />
        </>
      )}

      <Button
        css={tw`mt-6`}
        type={'primary'}
        loading={loading}
        loadingText={t('saving')}
        onClick={handleSubmit}
      >
        {t('save')}
      </Button>
    </Fragment>
  );
};

const ProfileForm = withTranslation()(BaseProfileForm);

export default ProfileForm;