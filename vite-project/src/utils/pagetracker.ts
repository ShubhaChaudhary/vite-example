import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

export const PageTracker: React.FC = () => {
  const [firstPage, setFirstPage] = useState(true); // Segment - first page tracked automatically on script load
  const location = useLocation();

  useEffect(() => {
    if (firstPage) {
      setFirstPage(false);
    } else {
      (window as any).analytics?.page();
    }
  }, [location]);

  return null;
};

export const track = (name: string, properties?: any) => {
  (window as any).analytics?.track(name, properties);

  if (process.env.ENABLE_AHOY_TRACKING === 'true') {
    api.ahoy.track(name, properties);
  }
};