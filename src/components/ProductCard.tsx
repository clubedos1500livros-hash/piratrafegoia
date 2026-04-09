import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatBRL } from '@/lib/money';
import { normalizeVideoUrl } from '@/lib/video';
import type { Product } from '@/types/product';

type Props = { product: Product };

let activeVideo: HTMLVideoElement | null = null;
const allCardVideos = new Set<HTMLVideoElement>();

function pauseOtherVideos(current: HTMLVideoElement) {
  allCardVideos.forEach((video) => {
    if (video !== current) {
      video.pause();
    }
  });
}

export function ProductCard({ product }: Props) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showVideo, setShowVideo] = useState(Boolean(product.video_url || product.video));
  const [videoFailed, setVideoFailed] = useState(false);
  const videoUrl = normalizeVideoUrl(product.video_url ?? product.video ?? null);
  const canShowVideo = Boolean(videoUrl) && !videoFailed;

  useEffect(() => {
    setVideoFailed(false);
    setShowVideo(Boolean(product.video_url || product.video));
  }, [product.video_url, product.video]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !canShowVideo) return;
    allCardVideos.add(videoEl);
    return () => {
      allCardVideos.delete(videoEl);
      if (activeVideo === videoEl) {
        activeVideo = null;
      }
    };
  }, [canShowVideo]);

  useEffect(() => {
    const cardEl = cardRef.current;
    const videoEl = videoRef.current;
    if (!cardEl || !videoEl || !canShowVideo) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
        if (visible) {
          pauseOtherVideos(videoEl);
          activeVideo = videoEl;
          try {
            await videoEl.play();
            setShowVideo(true);
          } catch {
            setShowVideo(true);
          }
          return;
        }

        videoEl.pause();
        if (activeVideo === videoEl) {
          activeVideo = null;
        }
        setShowVideo(true);
      },
      { threshold: 0.6 },
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [canShowVideo]);

  useEffect(() => {
    if (videoUrl) {
      console.log('VIDEO URL:', videoUrl);
    }
  }, [videoUrl]);

  return (
    <Link
      ref={cardRef}
      to={`/produto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-panel ring-1 ring-white/5 transition hover:ring-accent/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel-2">
        {canShowVideo ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl ?? undefined}
              poster={product.image_url}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                showVideo ? 'opacity-100' : 'opacity-0'
              }`}
              onError={() => {
                console.error('Erro ao carregar vídeo:', videoUrl);
                setVideoFailed(true);
                setShowVideo(false);
              }}
            />
            <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              Vídeo
            </span>
          </>
        ) : (
          <>
            <img
              src={product.image_url}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {videoUrl ? (
              <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                Video indisponivel
              </span>
            ) : null}
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-white group-hover:text-accent">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-zinc-400">{product.description}</p>
        <p className="mt-auto pt-2 text-lg font-bold text-accent">{formatBRL(product.price)}</p>
      </div>
    </Link>
  );
}
