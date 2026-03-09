import React from "react";
import { X, BookOpen, Calculator, Zap, Info } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <header className="modal-header">
          <BookOpen className="accent-blue" size={32} />
          <h2 className="text-3xl font-black tracking-tight">
            ABOUT <span className="accent-blue">NOVELTY THEORY</span>
          </h2>
        </header>

        <div className="modal-body custom-scrollbar">
          <section className="info-section">
            <h3 className="section-title">
              <Info size={16} /> What is Time Wave Zero?
            </h3>
            <p>
              Time Wave Zero is a mathematical formula and software program
              conceived by the late ethnobotanist and philosopher **Terence
              McKenna**. It is the practical application of **Novelty Theory**,
              which suggests that time is not a linear progression of neutral
              moments, but a fractal wave of "novelty" and "habit."
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <Zap size={16} /> Novelty vs. Habit
            </h3>
            <p>
              McKenna argued that the universe operates on two competing forces:
              **Habit** (repetition, entropy, and stasis) and **Novelty**
              (complexity, connectivity, and creative density). As time
              progresses, novelty supposedly increases at an exponential rate,
              leading toward a point of infinite complexity.
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <Calculator size={16} /> The Mathematical Basis
            </h3>
            <p>
              The wave is derived from the **King Wen sequence** of the I Ching,
              the ancient Chinese Book of Changes. McKenna and his brother
              Dennis identified mathematical patterns in the 64 hexagrams,
              transforming them into a set of 384 data points. Through a fractal
              summation process (powers of 64), these points generate a wave
              that maps the ingress of novelty into the world across multiple
              temporal scales.
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <BookOpen size={16} /> The 2012 Convergence
            </h3>
            <p>
              The Time Wave formula famously converges to **zero**—a point of
              maximum novelty—on **December 21, 2012**. McKenna believed this
              point (the "Teleological Attractor") represented a transition
              where historical time would end and a new kind of
              "post-historical" existence would begin, driven by total
              interconnectedness.
            </p>
          </section>

          <div
            className="glass"
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "rgba(0, 242, 255, 0.05)",
            }}
          >
            <p
              className="text-xs color-grey"
              style={{ lineHeight: "1.6", fontStyle: "italic" }}
            >
              "The universe is not made of atoms, it's made of stories. The Time
              Wave is one of the most complex stories ever told about the
              structure of time itself." — Inspired by Terence McKenna
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
