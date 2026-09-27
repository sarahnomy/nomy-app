import { router } from 'expo-router';

export function goBackOrReplace(fallbackHref: Parameters<typeof router.replace>[0]) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}

export function originToHref(origin?: string | string[]) {
  const value = Array.isArray(origin) ? origin[0] : origin;

  if (value === 'home') {
    return '/' as const;
  }

  if (value === 'support') {
    return '/support' as const;
  }

  if (value === 'profile') {
    return '/profile' as const;
  }

  if (value === 'toolkit') {
    return '/toolkit' as const;
  }

  if (value === 'dailies') {
    return '/dailies' as const;
  }

  return null;
}

export function goBackToOriginOrReplace(origin: string | string[] | undefined, fallbackHref: Parameters<typeof router.replace>[0]) {
  const originHref = originToHref(origin);

  if (originHref) {
    router.replace(originHref);
    return;
  }

  goBackOrReplace(fallbackHref);
}
