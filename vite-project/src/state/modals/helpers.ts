import { useRecoilCallback } from 'recoil';
import { modalOpenState, modalState } from '.';
import { track } from '../../utils/analytics';

export const useModalHelpers = () => {
  const openModal = useRecoilCallback(
    ({ set }) =>
      (modalName: string, data: any = {}, trackingData: any = {}) => {
        track('modal.opened', { modalName, ...trackingData });
        set(modalState(modalName), {
          open: true,
          data
        });
      },
    []
  );

  const closeModal = useRecoilCallback(
    ({ set }) =>
      (modalName: string, trackingData: any = {}) => {
        track('modal.closed', { modalName, ...trackingData });
        set(modalState(modalName), (modal) => ({
          ...modal,
          open: false
        }));
      },
    []
  );

  const toggleModal = useRecoilCallback(
    ({ set, snapshot }) =>
      async (modalName: string, trackingData: any = {}) => {
        const open = await snapshot.getPromise(modalOpenState(modalName));

        track(open ? 'modal.closed' : 'modal.opened', {
          modalName,
          ...trackingData
        });

        set(modalState(modalName), (modal) => ({
          ...modal,
          open: !open
        }));
      },
    []
  );

  return {
    openModal,
    closeModal,
    toggleModal
  };
};