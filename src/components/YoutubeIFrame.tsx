import React, { useState, useEffect, useCallback, useRef } from "react";

interface IProps {
  videoURL: string
  title: string;
}

const YoutubeIFrame: React.FC<IProps> = (props) => {
  const { videoURL, title } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const defaultHeight = 495;
  const [videoHeight, setVideoHeight] = useState<number>(
    iframeRef.current ? iframeRef.current.offsetWidth * 0.5625 : defaultHeight
  );

  const handleChangeVideoWidth = useCallback(() => {
    const ratio =
      window.innerWidth > 990
        ? 1.0
        : window.innerWidth > 522
        ? 1.2
        : window.innerWidth > 400
        ? 1.45
        : 1.85;
    const height = iframeRef.current
      ? iframeRef.current.offsetWidth * 0.5625
      : defaultHeight;
    return setVideoHeight(Math.floor(height * ratio));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleChangeVideoWidth);
    const ratio =
      window.innerWidth > 990
        ? 1.0
        : window.innerWidth > 522
        ? 1.2
        : window.innerWidth > 400
        ? 1.45
        : 1.85;
    const height = iframeRef.current
      ? iframeRef.current.offsetWidth * 0.5625
      : defaultHeight;
    setVideoHeight(Math.floor(height * ratio));
    return function cleanup() {
      window.removeEventListener("resize", handleChangeVideoWidth);
    };
  }, [videoHeight, handleChangeVideoWidth]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      width="50%"
      className="rounded-2xl overflow-hidden mx-auto"
      height={`${videoHeight}px`}
      src={videoURL}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
};

export default YoutubeIFrame;
