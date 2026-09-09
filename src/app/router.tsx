import { type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { HomePage, ItemsPage } from '@/pages/HomePage';
import { ItemDetailPage } from '@/pages/ItemDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { FoundNewPage } from '@/pages/FoundNewPage';
import { FoundEditPage } from '@/pages/FoundEditPage';
import { LostNewPage } from '@/pages/LostNewPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { PaymentReturnPage } from '@/pages/PaymentReturnPage';
import { SearchDetailPage } from '@/pages/SearchDetailPage';
import { ClaimPage } from '@/pages/ClaimPage';
import { HandoffPage } from '@/pages/HandoffPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function Guard({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/:itemId" element={<ItemDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/found/new" element={<Guard><FoundNewPage /></Guard>} />
        <Route path="/found/:itemId/edit" element={<Guard><FoundEditPage /></Guard>} />
        <Route path="/lost/new" element={<Guard><LostNewPage /></Guard>} />
        <Route path="/searches/:searchId/checkout" element={<Guard><CheckoutPage /></Guard>} />
        <Route path="/payments/return" element={<Guard><PaymentReturnPage /></Guard>} />
        <Route path="/searches/:searchId" element={<Guard><SearchDetailPage /></Guard>} />
        <Route path="/claims/:claimId" element={<Guard><ClaimPage /></Guard>} />
        <Route path="/handoffs/:handoffId" element={<Guard><HandoffPage /></Guard>} />
        <Route path="/activity" element={<Guard><ActivityPage /></Guard>} />
        <Route path="/rewards" element={<Guard><RewardsPage /></Guard>} />
        <Route path="/profile" element={<Guard><ProfilePage /></Guard>} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
