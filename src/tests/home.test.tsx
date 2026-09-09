import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';

describe('home', () => {
  it('uses shared amounts and does not claim a find guarantee', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /잃어버린 물건과/ })).toBeInTheDocument();
    expect(screen.getAllByText(/5,000원/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3,500원/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1,500원/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/일치 확률 98%/)).not.toBeInTheDocument();
  });
});
