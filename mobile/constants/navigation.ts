import { router } from 'expo-router';

export function goBackOrReplace(fallbackHref: Parameters<typeof router.replace>[0]) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
