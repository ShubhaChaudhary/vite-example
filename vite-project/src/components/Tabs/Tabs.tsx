import React from 'react';
import tw from 'twin.macro';
import Badge, { BadgeProps } from '../Badge/Badge';
import SelectMenu from '../SelectMenu/SelectMenu';
import { useTranslation } from 'react-i18next';

interface Tab {
  name: string;
  key: string;
  badge?: React.ReactNode;
  badgeType?: BadgeProps['type'];
  testId?: string;
}

interface TabsProps {
  tab?: string;
  tabs: Tab[];
  onNavigate?: (tab: string) => void;
  children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tab, tabs, children, onNavigate }) => {
  const defaultTab = tabs.length > 0 ? tabs[0].key : undefined;
  const currentTab = tab || defaultTab;

  const { t } = useTranslation();

  return (
    <div>
      <div css={tw`sm:hidden mb-4`}>
        <label htmlFor="tabs" css={tw`sr-only`}>
          {t('select_a_tab')}
        </label>

        <SelectMenu
          onChange={(value) => onNavigate && onNavigate(value)}
          options={tabs.map(({ name, key }) => ({
            label: name,
            value: key
          }))}
        />
      </div>

      <div css={tw`hidden sm:block mb-4`}>
        <div css={tw`border-b border-base-2`}>
          <nav css={tw`-mb-px flex space-x-8`} aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                type={'button'}
                key={tab.key}
                css={[
                  tab.key === currentTab
                    ? tw`border-primary-500 text-primary-600`
                    : tw`border-transparent text-base-12 hover:text-base-17 hover:border-base-2`,
                  tw`whitespace-nowrap flex py-3 px-1 border-b-2 font-medium text-sm focus:outline-none focus:border-primary-500`
                ]}
                onClick={() => onNavigate && onNavigate(tab.key)}
                aria-current={tab.key === currentTab ? 'page' : undefined}
                data-testid={tab.testId}
              >
                {tab.name}
                {typeof tab.badge !== 'undefined' && (
                  <Badge type={tab.badgeType} css={tw`ml-3`}>
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
};

export default Tabs;