import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import type { Channel } from "@/lib/api";

function canUseNativeHls(video: HTMLVideoElement) {
  return video.canPlayType("application/vnd.apple.mpegurl") !== "";
}

export function ChannelPlayer({ channel }: { channel: Channel }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError("");

    // Destroy previous HLS instance to prevent duplicate segment requests.
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.pause();
    video.removeAttribute("src");
    video.load();

    const src = channel.playbackUrl;
    const isHls = channel.streamType === "hls" || src.toLowerCase().includes(".m3u8");

    if (isHls) {
      if (canUseNativeHls(video)) {
        video.src = src;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            setError(
              data.type === Hls.ErrorTypes.NETWORK_ERROR
                ? "Stream network request failed. Upstream may block your network or browser."
                : "Stream failed to load.",
            );
          }
        });
      } else {
        setError("Browser does not support this live stream.");
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel._id, channel.playbackUrl, channel.streamType]);

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
      <div className="aspect-video bg-black">
        <video
          ref={videoRef}
          controls
          playsInline
          poster={channel.poster || undefined}
          className="h-full w-full bg-black object-contain"
        />
      </div>
      {error ? (
        <div className="border-t border-white/10 bg-destructive/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
