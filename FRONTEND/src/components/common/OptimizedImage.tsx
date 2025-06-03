// components/common/OptimizedImage.tsx
"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import styles from "./optimized-image.module.css";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
  feedId: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  onClick,
  // feedId,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const MAX_RETRIES = 2;

  // Intersection Observer로 지연 로딩
  useEffect(() => {
    if (priority) return; // priority 이미지는 즉시 로드

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 뷰포트에 들어오면 로드 시작
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "50px" } // 50px 전에 미리 로드
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    if (retryCount < MAX_RETRIES) {
      setTimeout(
        () => {
          setRetryCount((prev) => prev + 1);
          setHasError(false);
        },
        1000 * (retryCount + 1)
      ); // 점진적 재시도 간격
    } else {
      setHasError(true);
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount(0);
    setHasError(false);
    setIsLoaded(false);
  };

  // 이미지 URL 최적화
  const optimizedSrc = src.includes("/api/image-proxy")
    ? src
    : `/api/image-proxy?url=${encodeURIComponent(src)}&w=${width}&q=75`;

  return (
    <div ref={imgRef} className={`${styles.container} ${className}`} onClick={onClick}>
      {(isLoaded || priority) && !hasError ? (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={priority ? 85 : 75}
          sizes="(max-width: 768px) 50vw, 25vw"
          className={styles.image}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRIbDl5o7/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRIbDl5o7/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRIbDl5o7"
        />
      ) : hasError ? (
        <div className={styles.error}>
          <span>이미지 로드 실패</span>
          <button onClick={handleRetry} className={styles.retryBtn}>
            재시도
          </button>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.skeleton}></div>
        </div>
      )}
    </div>
  );
}
