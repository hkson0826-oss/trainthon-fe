import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LockedPickupInfo } from '@/components/ui/LockedPickupInfo';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage';

describe('locked pickup', () => {
  it('does not render a precise address', () => {
    render(<LockedPickupInfo />);
    expect(screen.getByText('소유권 확인 후 안내')).toBeInTheDocument();
    expect(screen.queryByText(/공학관 1층 안내데스크/)).not.toBeInTheDocument();
  });
});

describe('payment return', () => {
  it('does not treat query success as paid', () => {
    render(
      <MemoryRouter initialEntries={['/payments/return?status=success']}>
        <PaymentReturnPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('결제 결과를 확인하고 있어요')).toBeInTheDocument();
    expect(screen.getByText('결제 정보를 찾지 못했어요.')).toBeInTheDocument();
    expect(screen.queryByText('결제가 확인되어 탐색을 시작했어요.')).not.toBeInTheDocument();
    expect(screen.getByText(/주소의 성공\/실패 문구는 결제 상태의 근거가 아닙니다/)).toBeInTheDocument();
  });
});
