import { getYear } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import tw from 'twin.macro';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      css={tw`mt-8 sm:mt-16 flex flex-col-reverse space-y-3 space-y-reverse sm:space-y-0 sm:flex-row justify-between items-center`}
    >
      <p css={tw`text-base-13 text-xs font-medium`}>
        {t('copyright', { year: getYear(new Date()) })}
      </p>

      <div css={tw`flex items-center space-x-4`}>
        <a
          href={process.env.PRIVACY_POLICY_URL}
          css={tw`text-xs font-semibold text-base-17 hover:text-base-18`}
          rel={'noreferrer'}
          target={'_blank'}
        >
          {t('privacy_policy')}
        </a>

        <a
          href={process.env.TERMS_OF_SERVICE_URL}
          css={tw`text-xs font-semibold text-base-17 hover:text-base-18`}
          rel={'noreferrer'}
          target={'_blank'}
        >
          {t('terms_of_service')}
        </a>
      </div>
    </div>
  );
};

export default Footer;