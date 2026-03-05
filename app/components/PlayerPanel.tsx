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
  onOpen,
  onPrev,
  onNext,
}: {
  track: Track | null;
  module: ModuleKey;
  onOpen: () => void;
  onPrev: () => void;
  onNext: () => void;
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
        <button className="mc-iconBtn mc-iconBtnPrimary" onClick={onOpen} aria-label="Open">
          ▶
        </button>
        <button className="mc-iconBtn" onClick={onNext} aria-label="Next">
          ⏭
        </button>
        <div className="mc-playerSpacer" />
        <button className="mc-iconBtn" onClick={onOpen} aria-label="Open link">
          ↗
        </button>
      </div>

      <div className="mc-playerHint">Open uses the station destination link (Untitled/Canva). Audio playback can be wired once we have direct audio URLs.</div>
    </div>
  );
}
