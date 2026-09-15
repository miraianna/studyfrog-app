export type TelegramUser = {
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TelegramInsets = {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
};

type TelegramWebApp = {
  BackButton?: {
    hide: () => void;
    offClick: (callback: () => void) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
  };
  contentSafeAreaInset?: TelegramInsets;
  expand: () => void;
  initDataUnsafe?: { user?: TelegramUser };
  offEvent: (eventType: string, callback: () => void) => void;
  onEvent: (eventType: string, callback: () => void) => void;
  ready: () => void;
  safeAreaInset?: TelegramInsets;
  setBackgroundColor?: (color: string) => void;
  setHeaderColor?: (color: string) => void;
  themeParams?: Record<string, string | undefined>;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

function setInsetVariables(insets: TelegramInsets | undefined) {
  const root = document.documentElement;

  root.style.setProperty('--tg-safe-area-top', `${insets?.top ?? 0}px`);
  root.style.setProperty('--tg-safe-area-right', `${insets?.right ?? 0}px`);
  root.style.setProperty('--tg-safe-area-bottom', `${insets?.bottom ?? 0}px`);
  root.style.setProperty('--tg-safe-area-left', `${insets?.left ?? 0}px`);
}

function applyTelegramAppearance(webApp: TelegramWebApp) {
  const root = document.documentElement;
  const theme = webApp.themeParams ?? {};

  root.style.setProperty('--tg-app-bg', theme.bg_color ?? '');
  root.style.setProperty('--tg-app-surface', theme.secondary_bg_color ?? theme.bg_color ?? '');
  root.style.setProperty('--tg-app-text', theme.text_color ?? '');
  root.style.setProperty('--tg-app-muted', theme.hint_color ?? '');
  setInsetVariables(webApp.contentSafeAreaInset ?? webApp.safeAreaInset);
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function initializeTelegramWebApp(onUserChange: (user: TelegramUser | null) => void) {
  const webApp = getTelegramWebApp();

  if (!webApp) {
    return undefined;
  }

  const sync = () => {
    applyTelegramAppearance(webApp);
    onUserChange(webApp.initDataUnsafe?.user ?? null);
  };

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.('bg_color');
  webApp.setBackgroundColor?.('bg_color');
  sync();
  webApp.onEvent('themeChanged', sync);
  webApp.onEvent('safeAreaChanged', sync);
  webApp.onEvent('contentSafeAreaChanged', sync);

  return () => {
    webApp.offEvent('themeChanged', sync);
    webApp.offEvent('safeAreaChanged', sync);
    webApp.offEvent('contentSafeAreaChanged', sync);
  };
}
