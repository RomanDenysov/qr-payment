export function Background() {
  return (
    <>
      {/* Noise grain layer - paper/terminal texture */}
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-noise opacity-[0.035] dark:opacity-[0.05]" />
      {/* Scanlines for CRT/old terminal effect */}
      <div className="pointer-events-none fixed inset-0 z-[-1] bg-scanlines" />
      {/* Vignette - CRT edge darkening */}
      <div className="pointer-events-none fixed inset-0 z-[-2] bg-vignette" />
    </>
  );
}
