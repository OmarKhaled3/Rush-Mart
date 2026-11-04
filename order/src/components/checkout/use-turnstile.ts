'use client';

import { useCallback, useEffect, useRef } from 'react';

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error('turnstile_load_failed'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Cloudflare Turnstile for the anonymous sign-in at checkout. Invisible unless Cloudflare needs
 * an interaction. With no site key (local dev) `getToken` resolves to undefined and the hosted
 * Supabase captcha setting is what actually enforces it.
 */
export function useTurnstile(siteKey: string | undefined, locale: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const pending = useRef<{ resolve: (t: string) => void; reject: (e: Error) => void } | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          execution: 'execute',
          appearance: 'interaction-only',
          language: locale,
          callback: (token: string) => pending.current?.resolve(token),
          'error-callback': () => pending.current?.reject(new Error('captcha_failed')),
          'expired-callback': () => pending.current?.reject(new Error('captcha_failed')),
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, locale]);

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!siteKey) return undefined;
    await loadScript();
    const ts = window.turnstile;
    const id = widgetId.current;
    if (!ts || !id) throw new Error('captcha_failed');
    const token = new Promise<string>((resolve, reject) => {
      pending.current = { resolve, reject };
    });
    ts.reset(id);
    ts.execute(id);
    try {
      return await token;
    } finally {
      pending.current = null;
    }
  }, [siteKey]);

  return { containerRef, getToken };
}
