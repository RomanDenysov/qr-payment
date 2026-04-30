export function buildColorOption(
  dark: string | undefined,
  light: string | undefined
): { dark?: string; light?: string } | undefined {
  if (!(dark || light)) {
    return;
  }
  return {
    ...(dark && { dark }),
    ...(light && { light }),
  };
}
