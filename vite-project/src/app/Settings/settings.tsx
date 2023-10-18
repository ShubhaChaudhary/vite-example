import React, { Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import ListMenu, { ListMenuItem } from '../../components/ListMenu/ListMenu';
import ListMenuAction from '../../components/ListMenuAction';
import PageTitle from '../../components/PageTitle';
import ProfilePage from './profile/ProfilePage';
import NotificationsPage from './notifications/NotificationsPage';
import IntegrationsPage from './team/integrations/IntegrationsPage';
import TeamUsagePage from './team/usage/TeamUsagePage';
import TeamPage from './team/members/TeamPage';
import { Heading6 } from '../../components/Heading/Heading';
import { useFeature } from '../../state/currentUser/helpers';
import tw from 'twin.macro';
import { useTranslation } from 'react-i18next';
import { useAuthHelpers } from '../../state/auth';
import SettingsDropdown from './SettingsDropdown';
import { useRecoilValue } from 'recoil';
import { isEmbeddedState } from '../../state/embedded/selectors';

const Settings = () => {
  const { t } = useTranslation();
  const authHelpers = useAuthHelpers();
  const integrationsFeature = useFeature('integrations');

  const isAppEmbedded = useRecoilValue(isEmbeddedState);

  return (
    <Fragment>
      <PageTitle title={t('nav:settings')} />
      <div css={tw`w-full flex flex-col items-center p-4 sm:p-6 lg:p-8`}>
        <div css={tw`lg:flex max-w-4xl w-full`}>
          <div
            css={tw`lg:hidden py-4 sticky lg:static bg-base-1 top-0 z-20 left-0 right-0 -mx-2 px-2`}
          >
            <SettingsDropdown isAppEmbedded={isAppEmbedded} />
          </div>
          <div css={tw`w-44 lg:mr-4 hidden lg:inline`}>
            <Heading6>{t('glossary:account')}</Heading6>
            <ListMenu fontSize={2} ml={-1}>
              <ListMenuItem>
                <ListMenuAction
                  to="/settings/profile"
                  data-testid={'Settings Menu - Account Profile'}
                >
                  {t('nav:profile')}
                </ListMenuAction>

                {!isAppEmbedded && (
                  <>
                    <ListMenuAction
                      to="/settings/notifications"
                      data-testid={'Settings Menu - Notifications'}
                    >
                      {t('nav:notifications')}
                    </ListMenuAction>
                    <ListMenuAction
                      as="a"
                      onClick={authHelpers.logout}
                      data-testid={'Settings Menu - Logout'}
                    >
                      {t('nav:logout')}
                    </ListMenuAction>
                  </>
                )}
              </ListMenuItem>
            </ListMenu>
            <Heading6>{t('glossary:team')}</Heading6>
            <ListMenu ml={-1} fontSize={2}>
              {!isAppEmbedded && (
                <ListMenuItem>
                  <ListMenuAction
                    to="/settings/team/members"
                    data-testid={'Settings Menu - Team Members'}
                  >
                    {t('nav:members')}
                  </ListMenuAction>
                </ListMenuItem>
              )}
              {integrationsFeature.enabled && (
                <ListMenuItem>
                  <ListMenuAction
                    to="/settings/team/integrations"
                    data-testid={'Settings Menu - Integrations'}
                  >
                    {t('nav:integrations')}
                  </ListMenuAction>
                </ListMenuItem>
              )}
              {
                <ListMenuItem>
                  <ListMenuAction
                    to="/settings/team/usage"
                    data-testid={'Settings Menu - Usage'}
                  >
                    {t('nav:usage')}
                  </ListMenuAction>
                </ListMenuItem>
              }
            </ListMenu>
          </div>

          <div css={tw`flex-1`}>
            <Switch>
              {!isAppEmbedded && (
                <Route
                  path="/settings/team/members"
                  exact
                  render={() => <TeamPage />}
                />
              )}

              {integrationsFeature.enabled && (
                <Route
                  path="/settings/team/integrations/:connect?"
                  exact
                  render={() => <IntegrationsPage />}
                />
              )}

              {
                <Route
                  path="/settings/team/usage"
                  exact
                  component={TeamUsagePage}
                />
              }

              <Route
                path="/settings/profile"
                exact
                render={() => <ProfilePage />}
              />

              {!isAppEmbedded && (
                <Route
                  path="/settings/notifications"
                  exact
                  render={() => <NotificationsPage />}
                />
              )}

              <Route render={() => <Redirect to="/settings/profile" />} />
            </Switch>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Settings;