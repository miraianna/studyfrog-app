import type { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="app">
      <div className="phone">
        <div className="screen-stack">{children}</div>
      </div>
    </main>
  );
}

export default AppLayout;
