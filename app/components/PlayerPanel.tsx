"use client";

import type { ModuleKey } from "./SideMenu";

export type Track = {
  key: string;
  title: string;
  systemLine: "Red" | "Blue" | "Purple" | "Gold";
  lineColor: string;
  href: string;
  code: string;
};

export function PlayerPanel({
  track,
  module,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  onOpenLink,
}: {
  track: Track | null;
  module: ModuleKey;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenLink: () => void;
}) {
  const title = track?.title ?? "—";
  const code = track?.code ?? "";
  const sub = track ? `${code} • ${track.systemLine}` : "Select a station";

  return (
    <div className="mc-player">
      <div className="mc-playerTop">
        <div className="mc-playerArt" />
        <div className="mc-playerMeta">
          <div className="mc-playerTitle">{title}</div>
          <div className="mc-playerSub">{sub}</div>
          <div className="mc-playerMode">Module: {module.toUpperCase()}</div>
        </div>
        {track ? (
          <span className="mc-pill" style={{ borderColor: track.lineColor, color: track.lineColor }}>
            {track.systemLine.toUpperCase()}
          </span>
        ) : null}
      </div>

      <div className="mc-playerControls">
        <button className="mc-iconBtn" onClick={onPrev} aria-label="Previous">
          ⏮
        </button>
        <button className="mc-iconBtn mc-iconBtnPrimary" onClick={onPlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="mc-iconBtn" onClick={onNext} aria-label="Next">
          ⏭
        </button>
        <div className="mc-playerSpacer" />
        <button className="mc-iconBtn" onClick={onOpenLink} aria-label="Open link">
          ↗
        </button>
      </div>

      <div className="mc-playerHint">Uses a hidden YouTube playlist player under the hood. If autoplay is blocked, tap Play once.</div>
    </div>
  );
}
