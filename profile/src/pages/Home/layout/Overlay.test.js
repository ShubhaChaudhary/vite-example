import { render, screen } from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom'

import Overlay from './Overlay';

test('renders learn react link', () => {
  render(<Overlay />,{wrapper: BrowserRouter});
  const linkElement = screen.getByText(/About Me/i);
  expect(linkElement).toBeInTheDocument();
});
