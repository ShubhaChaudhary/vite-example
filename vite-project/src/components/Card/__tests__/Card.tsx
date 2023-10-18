import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Card from '../Card';
import React from 'react';

expect.extend(toHaveNoViolations);

test('has no basic accessibility issues', async () => {
  const { container } = render(<Card />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});