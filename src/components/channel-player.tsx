import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { API_URL, type Channel } from "@/lib/api";

function canUseNativeHls(video: HTMLVideoElement) {
  return video.canPlayType("application/vnd.apple.mpegurl") !== "";
}

function resolvePlaybackUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path}`;
}

export function ChannelPlayer({ channel }: { channel: Channel }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError("");
    video.pause();
    video.removeAttribute("src");
    video.load();

    let hls: Hls | null = null;
    const directSrc = resolvePlaybackUrl(channel.playbackUrl);
    const proxySrc = resolvePlaybackUrl(channel.proxyPlaybackUrl);
    let retriedWithProxy = false;

    const attachSource = (src: string) => {
      if (hls) {
        hls.destroy();
        hls = null;
      }

      if (channel.streamType === "hls") {
        if (canUseNativeHls(video)) {
          video.src = src;
        } else if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              const canRetryProxy = !retriedWithProxy && src !== proxySrc;
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR && canRetryProxy) {
                retriedWithProxy = true;
                setError("Direct source blocked. Retrying through protected proxy...");
                attachSource(proxySrc);
                return;
              }
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setError("Stream network request failed. Source may block browser or proxy.");
              } else {
                setError("Stream failed to load.");
              }
            }
          });
        } else {
          setError("Browser does not support this live stream.");
        }
      } else {
        video.src = src;
      }
    };

    attachSource(directSrc);

    return () => {
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel]);

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
