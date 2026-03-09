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
              conceived by the late ethnobotanist and philosopher{" "}
              <a href="https://en.wikipedia.org/wiki/Terence_McKenna">
                Terence McKenna
              </a>
              . It is the practical application of{" "}
              <a href="https://wiki.omega-research.org/Novelty_theory">
                Novelty Theory
              </a>
              , which suggests that time is not a linear progression of neutral
              moments, but a fractal wave of "novelty" and "habit."
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <Zap size={16} /> Novelty vs. Habit
            </h3>
            <p>
              McKenna argued that the universe operates on two competing forces:{" "}
              <b>Habit</b> (repetition, entropy, and stasis) and <b>Novelty</b>{" "}
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
              The wave is derived from the{" "}
              <a href="https://en.wikipedia.org/wiki/King_Wen_sequence">
                King Wen sequence
              </a>{" "}
              of the{" "}
              <a href="https://en.wikipedia.org/wiki/I_Ching">
                I Ching, the ancient Chinese Book of Changes
              </a>
              . McKenna and his brother{" "}
              <a href="https://en.wikipedia.org/wiki/Dennis_McKenna">Dennis</a>{" "}
              identified mathematical patterns in the 64 hexagrams, transforming
              them into a set of 384 data points. Through a fractal summation
              process (powers of 64), these points generate a wave that maps the
              ingress of novelty into the world across multiple temporal scales.
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <Info size={16} /> Whitehead & Process Philosophy
            </h3>
            <p>
              McKenna's metaphysics were deeply influenced by the process
              philosophy of{" "}
              <a href="https://en.wikipedia.org/wiki/Alfred_North_Whitehead">
                Alfred North Whitehead
              </a>
              . Following Whitehead, McKenna viewed the universe not as a
              collection of static material objects, but as a series of
              interconnected <b>events</b> and processes. He borrowed the term{" "}
              <b>Concrescence</b> to describe the "tightening gyre" of history,
              where all information and complexity flow together toward a final
              nexus of completion.
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <BookOpen size={16} /> The 2012 Convergence
            </h3>
            <p>
              The Time Wave formula famously converges to <b>zero</b> — a point
              of maximum novelty — on{" "}
              <a href="https://en.wikipedia.org/wiki/2012_phenomenon">
                December 21, 2012
              </a>
              . McKenna believed this point (the "Teleological Attractor")
              represented a transition where historical time would end and a new
              kind of "post-historical" existence would begin, driven by total
              interconnectedness.
            </p>
          </section>

          <section className="info-section">
            <h3 className="section-title">
              <Zap size={16} /> Project Credits
            </h3>
            <p>
              This open-source visualization was created by{" "}
              <a href="https://www.christianmarques.com">Christian Marques</a>.
              It is a non-commercial tribute to the work of Terence and Dennis
              McKenna and the mathematics of novelty.
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
              <blockquote>
                The world which we perceive is a tiny fraction of the world
                which we can perceive, which is a tiny fraction of the
                perceivable world — Terence McKenna
              </blockquote>{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
