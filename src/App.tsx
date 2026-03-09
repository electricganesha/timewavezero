import { useState, useEffect, memo } from "react";
import { NoveltyChart } from "./components/NoveltyChart";
import { getNoveltyAtDate, ZERO_DATE } from "./engine/timewaveEngine";
import { Clock, Info, Calendar, Activity, Zap } from "lucide-react";
import { AboutModal } from "./components/AboutModal";

const PRESETS = [
  { label: "Big Bang (22B Years)", days: 22e9 * 365.25, endOffset: -365 * 14 },
  { label: "Earth History (7B Years)", days: 7e9 * 365.25, endOffset: 0 },
  { label: "Long Term (10k Years)", days: 3652500, endOffset: 0 },
  { label: "Human History (2k Years)", days: 730500, endOffset: 0 },
  { label: "Last 100 Years", days: 36525, endOffset: 0 },
  { label: "The 2012 Singularity", days: 547, endOffset: -192 },
  { label: "The Future (Post-2012)", days: 100, endOffset: -150 },
];

const MemoizedNoveltyChart = memo(NoveltyChart);

const toISO = (ms: number) => {
  try {
    const d = new Date(ms);
    if (isNaN(d.getTime())) return "";
    // Date picker only handles positive years well
    if (d.getUTCFullYear() < 0 || d.getUTCFullYear() > 9999) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const getPresetRange = (preset: (typeof PRESETS)[0]) => {
  const msEnd = ZERO_DATE.getTime() - preset.endOffset * 24 * 60 * 60 * 1000;
  const msStart = msEnd - preset.days * 24 * 60 * 60 * 1000;
  return {
    start: toISO(msStart),
    end: toISO(msEnd),
  };
};

function App() {
  const [currentPreset, setCurrentPreset] = useState<
    (typeof PRESETS)[0] | "custom"
  >(PRESETS[4]);

  const [customRange, setCustomRange] = useState(() =>
    getPresetRange(PRESETS[4] as (typeof PRESETS)[0]),
  );

  const [now, setNow] = useState(new Date());
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [hoveredNovelty, setHoveredNovelty] = useState<number | null>(null);

  let startTimeMs: number;
  let endTimeMs: number;

  if (currentPreset === "custom") {
    startTimeMs = new Date(customRange.start).getTime();
    endTimeMs = new Date(customRange.end).getTime();
  } else {
    endTimeMs =
      ZERO_DATE.getTime() - currentPreset.endOffset * 24 * 60 * 60 * 1000;
    startTimeMs = endTimeMs - currentPreset.days * 24 * 60 * 60 * 1000;
  }

  const currentNovelty = getNoveltyAtDate(now);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-container">
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Header */}
      <header className="header">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            TIME WAVE <span className="accent-blue">ZERO</span>
          </h1>
          <p
            className="text-xs font-bold uppercase tracking-widest color-grey"
            style={{ color: "#555" }}
          >
            Novelty Theory Explorer
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <button className="btn-learn" onClick={() => setIsAboutOpen(true)}>
            What is this?
          </button>

          <div className="glass" style={{ padding: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} className="accent-blue" />
              <span className="mono text-xs">{now.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Sidebar Controls */}
        <section className="sidebar custom-scrollbar">
          <div className="glass">
            <h3
              className="text-xs uppercase tracking-widest color-grey"
              style={{
                color: "#888",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Calendar size={12} /> Time Span
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setCurrentPreset(p);
                    setCustomRange(getPresetRange(p));
                  }}
                  className={`preset-btn ${typeof currentPreset !== "string" && currentPreset.label === p.label ? "active" : ""}`}
                >
                  {p.label}
                </button>
              ))}

              <div className="date-input-group">
                <div className="date-field">
                  <label className="date-label">Start Date</label>
                  <input
                    type="date"
                    className="date-input"
                    value={customRange.start}
                    onChange={(e) => {
                      setCustomRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }));
                      setCurrentPreset("custom");
                    }}
                  />
                </div>
                <div className="date-field">
                  <label className="date-label">End Date</label>
                  <input
                    type="date"
                    className="date-input"
                    value={customRange.end}
                    onChange={(e) => {
                      setCustomRange((prev) => ({
                        ...prev,
                        end: e.target.value,
                      }));
                      setCurrentPreset("custom");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass novelty-display">
            <h3
              className="text-xs uppercase tracking-widest color-grey"
              style={{
                color: "#888",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Activity size={12} /> Novelty Index
            </h3>
            <div
              className="novelty-value"
              style={{ color: hoveredNovelty !== null ? "#00f2ff" : "inherit" }}
            >
              {hoveredNovelty !== null
                ? hoveredNovelty.toFixed(6)
                : currentNovelty.toFixed(6)}
            </div>
            <p
              className="text-xs color-dark-grey"
              style={{ color: "#444", lineHeight: "1.4" }}
            >
              Higher values indicate patterns of decreasing novelty. Zero
              represents the "Teleological Attractor Point".
            </p>
          </div>

          <div
            className="glass"
            style={{ marginTop: "auto", opacity: 0.6, padding: "16px" }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Info size={16} className="accent-magenta" />
              <p className="text-xs color-grey" style={{ color: "#888" }}>
                Wave converges to zero on Dec 21, 2012.
              </p>
            </div>
          </div>
        </section>

        {/* Chart View */}
        <section className="chart-section">
          <div className="chart-wrapper">
            <MemoizedNoveltyChart
              key={
                typeof currentPreset === "string"
                  ? `custom-${customRange.start}-${customRange.end}`
                  : currentPreset.label
              }
              startTime={startTimeMs}
              endTime={endTimeMs}
              onHoverValue={setHoveredNovelty}
            />
          </div>

          <div className="info-cards">
            <div
              className="glass"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "16px",
              }}
            >
              <Zap
                size={20}
                className="accent-blue"
                style={{ marginTop: "12px" }}
              />
              <div>
                <h4 className="text-xs font-bold">Mathematical Fractal</h4>
                <p className="text-xs color-grey" style={{ marginTop: "4px" }}>
                  Based on Peter Meyer's formalization. Summation across 64
                  <sup>2</sup>.{" "}
                  <button
                    onClick={() => setIsAboutOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "var(--accent-blue, #00f2ff)",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "inherit",
                      fontFamily: "inherit",
                    }}
                  >
                    Learn more
                  </button>
                </p>
              </div>
            </div>
            <div
              className="glass"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "16px",
              }}
            >
              <Zap
                size={20}
                className="accent-magenta"
                style={{ transform: "rotate(180deg)", marginTop: "2px" }}
              />
              <div>
                <h4 className="text-xs font-bold">Static Visualization</h4>
                <p className="text-xs color-grey" style={{ marginTop: "4px" }}>
                  Fixed time windows for historical trend analysis.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
