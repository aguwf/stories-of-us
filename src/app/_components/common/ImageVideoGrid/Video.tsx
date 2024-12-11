import React, { useRef, useEffect } from 'react';

interface VideoProps {
  src: string;
  className?: string;
}

const Video: React.FC<VideoProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => console.error("Autoplay failed:", error));
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted
      playsInline
      controls
    />
  );
};

export default Video;

