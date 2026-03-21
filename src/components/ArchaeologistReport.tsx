import ReactMarkdown from "react-markdown";
import { X, Calendar, Activity, Zap } from "lucide-react";
import type { ArchaeologistReport as ReportType } from "../services/aiArchaeologist";

interface ArchaeologistReportProps {
  report: ReportType | null;
  onClose: () => void;
  isOpen: boolean;
}

export const ArchaeologistReport: React.FC<ArchaeologistReportProps> = ({
  report,
  onClose,
  isOpen,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className={`archaeologist-panel ${isOpen ? "open" : ""}`}>
      <div className="panel-header">
        <h2 className="text-xl font-bold tracking-tighter">
          Fractal <span className="accent-magenta">Rhyme</span>
        </h2>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="panel-content custom-scrollbar">
        <div className="report-meta glass">
          <div className="meta-item">
            <Calendar size={14} className="accent-blue" />
            <span className="text-xs uppercase tracking-widest text-muted">
              Primary Date:
            </span>
            <span className="text-xs font-bold mono">{report.primaryDate}</span>
          </div>
          <div className="meta-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} className="accent-magenta" />
              <span className="text-xs uppercase tracking-widest text-muted">
                Resonance Echoes:
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '22px' }}>
              {report.echoDates.map((date, i) => (
                <span key={i} className="text-[10px] font-bold mono">
                  L{i+1}: {date}
                </span>
              ))}
            </div>
          </div>
          <div className="meta-item">
            <Activity size={14} className="accent-cyan" />
            <span className="text-xs uppercase tracking-widest text-muted">
              Novelty Slope:
            </span>
            <span className="text-xs font-bold uppercase mono">
              {report.noveltySlope}
            </span>
          </div>
        </div>

        <div className="synthesis-text">
          <ReactMarkdown>{report.synthesis}</ReactMarkdown>
        </div>

        <div className="panel-footer glass">
          <p className="text-[10px] text-very-muted leading-relaxed">
            "Every finite thing, or what is termed a mode, has a cause which is
            the infinite substance of the universe manifesting itself at a
            specific point of fractal complexity." — Spinozist Postulate
          </p>
        </div>
      </div>
    </div>
  );
};
