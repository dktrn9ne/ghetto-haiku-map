"use client";

export type ModuleKey = "tracks" | "lyrics" | "visuals" | "lore" | "community";

const ITEMS: { key: ModuleKey; label: string; icon: string }[] = [
  { key: "tracks", label: "Tracks", icon: "♪" },
  { key: "lyrics", label: "Lyrics", icon: "≡" },
  { key: "visuals", label: "Visuals", icon: "▣" },
  { key: "lore", label: "Lore", icon: "⌁" },
  { key: "community", label: "Community", icon: "◍" },
];

export function SideMenu({
  active,
  onChange,
}: {
  active: ModuleKey;
  onChange: (k: ModuleKey) => void;
}) {
  return (
    <aside className="mc-rail">
      <div className="mc-railBrand">
        <div className="mc-logo">◎</div>
        <div>
          <div className="mc-railTitle">CHANNEL</div>
          <div className="mc-railTitle2">N9NE</div>
        </div>
      </div>

      <div className="mc-railList">
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              className={isActive ? "mc-railBtn mc-railBtnActive" : "mc-railBtn"}
              onClick={() => onChange(it.key)}
            >
              <span className="mc-railIcon" aria-hidden>
                {it.icon}
              </span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mc-railFooter">
        <div className="mc-railHint">Tap stations on the map</div>
      </div>
    </aside>
  );
}
