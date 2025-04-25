import Sidebar from '../../components/Sidebar';

import { ReactNode } from 'react';

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
