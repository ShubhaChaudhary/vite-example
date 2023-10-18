import { atom } from 'recoil';
import { syncWithStorage } from '../effects';

export const navSidebarExpandedState = atom({
  key: 'navSidebarExpandedState',
  default: true,
  effects_UNSTABLE: [syncWithStorage('notiv_sidebar_expanded')]
});