import { useEffect, useRef } from 'react';

const LOGO_VIDEO_SRC = '/assets/logo3Dloop.webm';

/**
 * Logo 3D em loop para o topo (home hero e barra em páginas internas).
 * muted + playsInline + play() em efeito ajudam autoplay no mobile.
 */
export function HeaderLogo3D({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      void el.play().catch(() => {
        /* autoplay pode ser adiado no iOS até interação */
      });
    };

    tryPlay();
    el.addEventListener('loadeddata', tryPlay);

    return () => {
      el.removeEventListener('loadeddata', tryPlay);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={LOGO_VIDEO_SRC}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
      style={{ width: '150px', height: 'auto' }}
      className={className}
      aria-label="Logo"
    />
  );
}
