import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useModalHelpers } from '../state/modals/helpers';

export const PaymentRedirect: React.FC = () => {
  const modalHelpers = useModalHelpers();
  const location = useLocation();

  useEffect(() => {
    const payment = (window.location.search || location.search).match(
      /payment=(\w+)/
    );

    if (payment && payment[1] === 'success') {
      modalHelpers.openModal('paymentProcessed');
    }
  }, [location.search, window.location.search]);

  return null;
};