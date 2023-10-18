import { atomFamily, selectorFamily } from 'recoil';

type ModalData = Record<string, any>;

interface ModalState {
  open: boolean;
  data: ModalData;
}

export const modalState = atomFamily<ModalState, string>({
  key: 'modalState',
  default: {
    open: false,
    data: {}
  }
});

export const modalOpenState = selectorFamily<boolean, string>({
  key: 'modalOpenState',
  get:
    (key) =>
    ({ get }) =>
      get(modalState(key)).open
});

export const modalDataState = selectorFamily<ModalData, string>({
  key: 'modalDataState',
  get:
    (key) =>
    ({ get }) =>
      get(modalState(key)).data
});