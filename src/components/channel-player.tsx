import Hls from "hls.js";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Channel } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  PictureInPicture2,
  Radio,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const PLAYER_PREFS_KEY = "cupvision:player-prefs";

type VideoWithPresentationMode = HTMLVideoElement & {
  webkitPresentationMode?: "inline" | "picture-in-picture" | "fullscreen";
  webkitSupportsPresentationMode?: (mode: "inline" | "picture-in-picture" | "fullscreen") => boolean;
  webkitSetPresentationMode?: (mode: "inline" | "picture-in-picture" | "fullscreen") => void;
};

function canUseNativeHls(video: HTMLVideoElement) {
  return video.canPlayType("application/vnd.apple.mpegurl") !== "";
}

export function ChannelPlayer({
  channel,
  channelNumber,
  fullscreenChannels = [],
  onSelectChannel,
  onPrevChannel,
  onNextChannel,
}: {
  channel: Channel;
  channelNumber?: number;
  fullscreenChannels?: Channel[];
  onSelectChannel?: (channelId: string) => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastControlsToggleAt = useRef(0);
  // Guard against concurrent play() calls
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [fullscreen, setFullscreen] = useState(false);
  const [pip, setPip] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);

  /* ── Restore saved prefs ───────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PLAYER_PREFS_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw) as { muted?: boolean; volume?: number };
      if (typeof prefs.muted === "boolean") setMuted(prefs.muted);
      if (typeof prefs.volume === "number" && Number.isFinite(prefs.volume)) {
        setVolume(Math.min(1, Math.max(0, prefs.volume)));
      }
    } catch {
      // Ignore malformed saved prefs.
    }
  }, []);

  /* ── Persist prefs ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PLAYER_PREFS_KEY,
      JSON.stringify({
        muted,
        volume,
      }),
    );
  }, [muted, volume]);

  /* ── Attach HLS source ──────────────────────────────────────────────────
   *  KEY RULE: This effect ONLY sets state. It never calls video.play().
   *  The play/pause effect below is the single source of truth for playback.
   * ───────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset everything
    setError("");
    setReady(false);
    setPlaying(false);
    setBuffering(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // Abort any pending play promise before clearing src
    playPromiseRef.current = null;
    video.pause();
    video.removeAttribute("src");
    video.load();

    const src = channel.playbackUrl;
    if (!src) return;

    const isHls = channel.streamType === "hls" || src.toLowerCase().includes(".m3u8");

    // Called once stream is ready — sets BOTH ready+playing so the sync
    // effect below fires once and sees playing=true, not twice.
    const signalReady = () => {
      setReady(true);
      setPlaying(true); // intent: autoplay
    };

    if (isHls) {
      if (canUseNativeHls(video)) {
        video.src = src;
        video.addEventListener("loadedmetadata", signalReady, { once: true });
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, signalReady);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            setError(
              data.type === Hls.ErrorTypes.NETWORK_ERROR
                ? "Stream network request failed. The upstream may be offline or blocking your network."
                : "Stream failed to load.",
            );
          }
        });
      } else {
        setError("Your browser does not support this live stream.");
      }
    } else {
      video.src = src;
      video.addEventListener("loadedmetadata", signalReady, { once: true });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      playPromiseRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel._id, channel.playbackUrl, channel.streamType]);

  /* ── Single play / pause syncer ─────────────────────────────────────────
   *  This is the ONLY place video.play() / video.pause() are called.
   *  Guards against overlapping play() promises (the main cause of the loop).
   * ───────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;

    if (playing) {
      // If a play is already in flight, don't start another one
      if (playPromiseRef.current) return;

      video.muted = muted;
      video.volume = volume;
      const p = video.play();
      playPromiseRef.current = p;
      p.then(() => {
        playPromiseRef.current = null;
      }).catch((err: DOMException) => {
        playPromiseRef.current = null;
        // NotAllowedError = browser blocked autoplay with sound → stay muted
        if (err?.name === "NotAllowedError") {
          // Already muted — do nothing, user needs to interact
        } else {
          setPlaying(false);
        }
      });
    } else {
      // Wait for any pending play() to settle before pausing
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            playPromiseRef.current = null;
            video.pause();
          })
          .catch(() => {
            playPromiseRef.current = null;
          });
      } else {
        video.pause();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, ready]);

  /* ── Sync muted / volume separately ────────────────────────────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.volume = volume;
  }, [muted, volume]);

  /* ── Fullscreen listener ──────────────────────────────────────────── */
  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  /* ── PiP listener ─────────────────────────────────────────────────── */
  useEffect(() => {
    const video = videoRef.current as VideoWithPresentationMode | null;
    if (!video) return;

    const syncPip = () => {
      const standardPip = document.pictureInPictureElement === video;
      const webkitPip = video.webkitPresentationMode === "picture-in-picture";
      setPip(standardPip || webkitPip);
    };

    syncPip();
    video.addEventListener("enterpictureinpicture", syncPip);
    video.addEventListener("leavepictureinpicture", syncPip);
    video.addEventListener("webkitpresentationmodechanged", syncPip as EventListener);

    return () => {
      video.removeEventListener("enterpictureinpicture", syncPip);
      video.removeEventListener("leavepictureinpicture", syncPip);
      video.removeEventListener("webkitpresentationmodechanged", syncPip as EventListener);
    };
  }, [channel._id]);

  /* ── Auto-hide controls ───────────────────────────────────────────── */
  const scheduleHide = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const clearHideSchedule = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [scheduleHide]);

  const handleInteraction = useCallback(() => {
    if (fullscreen && Date.now() - lastControlsToggleAt.current < 350) return;
    setShowControls(true);
    scheduleHide();
  }, [fullscreen, scheduleHide]);

  const toggleControlsVisibility = useCallback(() => {
    lastControlsToggleAt.current = Date.now();
    clearHideSchedule();
    setShowControls((prev) => {
      const next = !prev;
      if (next) scheduleHide();
      return next;
    });
  }, [clearHideSchedule, scheduleHide]);

  const handlePointerUpInteraction = useCallback(() => {
    if (!fullscreen) return;
    toggleControlsVisibility();
  }, [fullscreen, toggleControlsVisibility]);

  /* ── Keyboard shortcuts ────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing =
        target?.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (typing) return;

      if (event.key === " " || event.key === "k") {
        event.preventDefault();
        setPlaying((prev) => !prev);
        handleInteraction();
        return;
      }

      if (event.key === "m") {
        event.preventDefault();
        toggleMute();
        handleInteraction();
        return;
      }

      if (event.key === "f") {
        event.preventDefault();
        void toggleFullscreen();
        handleInteraction();
        return;
      }

      if (event.key === "p") {
        event.preventDefault();
        void togglePip();
        handleInteraction();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setMuted(false);
        setVolume((prev) => Math.min(1, Number((prev + 0.05).toFixed(2))));
        handleInteraction();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setVolume((prev) => {
          const next = Math.max(0, Number((prev - 0.05).toFixed(2)));
          setMuted(next === 0);
          return next;
        });
        handleInteraction();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleInteraction, muted, volume]);

  /* ── Fullscreen toggle ────────────────────────────────────────────── */
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const canUsePip = () => {
    const video = videoRef.current as VideoWithPresentationMode | null;
    if (!video) return false;
    if (typeof document !== "undefined" && "pictureInPictureEnabled" in document) {
      if ((document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled) {
        return true;
      }
    }
    return !!video.webkitSupportsPresentationMode?.("picture-in-picture");
  };

  const togglePip = async () => {
    const video = videoRef.current as (HTMLVideoElement & {
      requestPictureInPicture?: () => Promise<PictureInPictureWindow>;
    } & VideoWithPresentationMode) | null;
    if (!video) return;

    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture?.();
        return;
      }
      if (video.webkitPresentationMode === "picture-in-picture") {
        video.webkitSetPresentationMode?.("inline");
        return;
      }
      if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        return;
      }
      if (video.webkitSupportsPresentationMode?.("picture-in-picture")) {
        video.webkitSetPresentationMode?.("picture-in-picture");
      }
    } catch {
      // Ignore PiP API failures from browser/user gesture restrictions.
    }
  };

  /* ── Mute toggle ──────────────────────────────────────────────────── */
  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      if (volume === 0) setVolume(0.5);
    } else {
      setMuted(true);
    }
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden bg-black select-none transition-all duration-200 ${
        fullscreen
          ? "w-full h-full rounded-none border-none"
          : "rounded-[1.5rem] border border-white/10"
      }`}
      onMouseMove={handleInteraction}
      onMouseLeave={() => setShowControls(false)}
      onPointerUp={handlePointerUpInteraction}
    >
      {/* ── Aspect-ratio wrapper ── */}
      <div className={`relative bg-black ${fullscreen ? "w-full h-full" : "aspect-video"}`}>
        {/* Poster / blur backdrop while buffering */}
        {channel.poster && !ready && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${channel.poster})` }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>
        )}

        {/* Native <video> — hls.js attaches here */}
        <video
          ref={videoRef}
          playsInline
          poster={channel.poster || undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            // Ignore spurious pause fired during src swap / load()
            if (videoRef.current?.readyState === 0) return;
            setPlaying(false);
          }}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onCanPlay={() => setBuffering(false)}
          className="absolute inset-0 h-full w-full bg-black object-contain"
        />

        {/* Loading / buffering spinner */}
        {(!ready || buffering) && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="size-12 text-white/60 animate-spin drop-shadow-lg" />
          </div>
        )}

        {/* ── Controls overlay ── */}
        <div
          className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Top bar: gradient + badges */}
          <div
            className="bg-gradient-to-b from-black/70 to-transparent px-4 pb-6 pt-4"
            onPointerUp={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-red-300 backdrop-blur">
                  <Radio className="size-3 animate-pulse" />
                  Live
                </span>
                {channel.category && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                    {channel.category}
                  </span>
                )}
                {typeof channelNumber === "number" && channelNumber > 0 ? (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                    CH {String(channelNumber).padStart(2, "0")}
                  </span>
                ) : null}
              </div>

              {fullscreen && fullscreenChannels.length > 1 ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/28 p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                      Channel switch
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onPrevChannel}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                      >
                        <ChevronLeft className="size-3.5" />
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={onNextChannel}
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                      >
                        Next
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {fullscreenChannels.map((item) => {
                      const active = item._id === channel._id;
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => onSelectChannel?.(item._id)}
                          className={`rounded-xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-primary/40 bg-primary/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <div className="truncate text-sm font-semibold text-white">
                            {item.name}
                          </div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                            {active ? "On Air" : item.category || "Live"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Bottom bar: gradient + controls */}
          <div
            className="bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-8"
            onPointerUp={(event) => event.stopPropagation()}
          >
            <p className="mb-2 text-sm font-semibold text-white drop-shadow">{channel.name}</p>

            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>

              {/* Volume button + slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  <VolumeIcon className="size-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setMuted(v === 0);
                  }}
                  className="volume-slider h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
                  aria-label="Volume"
                />
              </div>

              {/* Muted hint */}
              {muted && (
                <span className="hidden sm:inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-300">
                  Muted - click sound btn
                </span>
              )}

              <div className="flex-1" />

              {canUsePip() && (
                <button
                  onClick={togglePip}
                  className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95"
                  aria-label={pip ? "Exit picture in picture" : "Enter picture in picture"}
                >
                  <PictureInPicture2 className="size-4" />
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 active:scale-95"
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 border-t border-white/10 bg-destructive/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="size-4 shrink-0 text-red-400" />
          {error}
        </div>
      )}
    </div>
  );
}
