import React, { useState } from "react";
import { X, BookOpen, Calculator, Zap, Info, Binary } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "history" | "math" | "credits" | "origins";

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>("history");

  if (!isOpen) return null;

  const renderTheory = () => (
    <>
      <section className="info-section">
        <h3 className="section-title">
          <Info size={16} /> What is Time Wave Zero?
        </h3>
        <p>
          Time Wave Zero is a mathematical formula and software program
          conceived by the late ethnobotanist and philosopher{" "}
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://en.wikipedia.org/wiki/Terence_McKenna"
          >
            Terence McKenna
          </a>
          . It is the practical application of{" "}
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://wiki.omega-research.org/Novelty_theory"
          >
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
          (complexity, connectivity, and creative density). As time progresses,
          novelty supposedly increases at an exponential rate, leading toward a
          point of infinite complexity.
        </p>
      </section>

      <section className="info-section">
        <h3 className="section-title">
          <Info size={16} /> Whitehead & Process Philosophy
        </h3>
        <p>
          McKenna's metaphysics were deeply influenced by the process philosophy
          of{" "}
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://en.wikipedia.org/wiki/Alfred_North_Whitehead"
          >
            Alfred North Whitehead
          </a>
          . Following Whitehead, McKenna viewed the universe not as a collection
          of static material objects, but as a series of interconnected{" "}
          <b>events</b> and processes. He borrowed the term <b>Concrescence</b>{" "}
          to describe the "tightening gyre" of history, where all information
          and complexity flow together toward a final nexus of completion.
        </p>
      </section>

      <section className="info-section">
        <h3 className="section-title">
          <BookOpen size={16} /> The 2012 Convergence
        </h3>
        <p>
          The Time Wave formula famously converges to <b>zero</b> — a point of
          maximum novelty — on{" "}
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://en.wikipedia.org/wiki/2012_phenomenon"
          >
            December 21, 2012
          </a>
          . McKenna believed this point (the "Teleological Attractor")
          represented a transition where historical time would end and a new
          kind of "post-historical" existence would begin, driven by total
          interconnectedness.
        </p>
      </section>
    </>
  );

  const renderMath = () => (
    <>
      <section className="info-section">
        <h3 className="section-title">
          <Calculator size={16} /> The 384-Point Data Set
        </h3>
        <p>
          The mathematical core of the wave is derived from the{" "}
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://en.wikipedia.org/wiki/King_Wen_sequence"
          >
            King Wen sequence
          </a>{" "}
          of the I Ching. By analyzing the 64 hexagrams, McKenna identified a
          binary pattern of transitions (lines changing) that he mapped into 384
          data points (64 hexagrams × 6 lines). These numbers represent the
          foundation of the novelty/habit ratio.
        </p>
      </section>

      <section className="info-section">
        <h3 className="section-title">
          <Binary size={16} /> Fractal Summation (Powers of 64)
        </h3>
        <p>
          To create a wave that spans across all of history, the 384-point set
          is summed fractally. The formula adds up the data points at scales
          that are powers of 64:
          <ul
            style={{
              marginTop: "8px",
              marginLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <li>64 days (Biological/Personal scale)</li>
            <li>4,096 days (Approx. 11 years - Epochal scale)</li>
            <li>262,144 days (Approx. 717 years - Historical scale)</li>
            <li>...extending to 22 billion years (Cosmic scale)</li>
          </ul>
        </p>
      </section>

      <section className="info-section">
        <h3 className="section-title">
          <Zap size={16} /> The Zero Point
        </h3>
        <p>
          Because the wave is a fractal summation of finite parts, it eventually
          reaches a point where the value becomes exactly zero. In the
          mathematical model, this occurs on December 21, 2012. After this
          point, the formula reaches a "singularity" where novelty is no longer
          a measurable oscillation but a total state.
        </p>
        <p style={{ marginTop: "12px" }}>
          <a
            href="https://pdfhost.io/v/8ji5Spc8e_The_Mathematics_of_Timewave_Zero"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            Read the full technical paper: "The Mathematics of Timewave Zero"
          </a>
        </p>
      </section>
    </>
  );

  const renderOrigins = () => (
    <>
      <section className="info-section">
        <h3 className="section-title">
          <BookOpen size={16} /> The Genesis of Timewave Zero
        </h3>
        <p>
          In 1986, computer programmer <b>Peter Meyer</b> met{" "}
          <b>Terence McKenna</b>, enlisting in a project to formalize McKenna's
          intuitive theory of time—then known as "System Zero." McKenna’s vision
          was shaped by his 1970s Amazonian explorations and a fascination with
          the <i>I Ching</i>, positing that time is not a neutral backdrop but a
          structured wave of "novelty."
        </p>
        <p style={{ marginTop: "12px" }}>
          Meyer’s pivotal contribution was translating McKenna’s graphical
          intuitions into a <b>solid mathematical foundation</b>, revealing the
          Timewave as a genuine fractal that exhibits unlimited self-similarity
          under magnification. This collaboration birthed the original software
          for Apple //e and later MS-DOS, mapping historical events toward a
          final "Eschaton."
        </p>
        <p style={{ marginTop: "12px" }}>
          While McKenna famously linked the wave's zero-point to{" "}
          <b>December 21, 2012</b>—aligning it with the Mayan calendar and
          milestones like the Hiroshima bombing—Meyer clarifies that the
          mathematical model itself is a pure fractal. The choice of the "zero
          date" was an interpreted alignment, yet the theory remains a profound
          exploration of time as an endlessly creative and structured process.
        </p>
        <p style={{ marginTop: "12px" }}>
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://www.fractal-timewave.com/"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            Source: "Timewave Zero — the Final Explanation" by Peter Meyer
          </a>
        </p>
      </section>
    </>
  );

  const renderCredits = () => (
    <>
      <section className="info-section">
        <h3 className="section-title">
          <Zap size={16} /> Project Credits
        </h3>
        <p>
          This open-source visualization was created by{" "}
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://www.christianmarques.com"
          >
            Christian Marques
          </a>
          . It is a non-commercial tribute to the work of Terence and Dennis
          McKenna and the mathematics of novelty.
        </p>
        <p style={{ marginTop: "12px" }}>
          Special thanks to <b>Peter Meyer</b>, whose brilliant mathematical
          refinement and original software development made this theory
          accessible to the world. Explore his extensive work at{" "}
          <a
            href="https://www.fractal-timewave.com/"
            target="_blank"
            referrerPolicy="no-referrer"
          >
            fractal-timewave.com
          </a>
          .
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
            The world which we perceive is a tiny fraction of the world which we
            can perceive, which is a tiny fraction of the perceivable world —
            Terence McKenna
          </blockquote>{" "}
        </p>
      </div>
    </>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <header className="modal-header">
          <h2 className="text-3xl font-black tracking-tight">
            <BookOpen className="accent-blue" size={32} />
            ABOUT <span className="accent-blue">NOVELTY THEORY</span>
          </h2>
        </header>

        <nav className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Theory
          </button>
          <button
            className={`tab-btn ${activeTab === "math" ? "active" : ""}`}
            onClick={() => setActiveTab("math")}
          >
            Mathematics
          </button>
          <button
            className={`tab-btn ${activeTab === "origins" ? "active" : ""}`}
            onClick={() => setActiveTab("origins")}
          >
            Origins
          </button>
          <button
            className={`tab-btn ${activeTab === "credits" ? "active" : ""}`}
            onClick={() => setActiveTab("credits")}
          >
            Credits
          </button>
        </nav>

        <div className="modal-body custom-scrollbar">
          <div className="tab-content" key={activeTab}>
            {activeTab === "history" && renderTheory()}
            {activeTab === "math" && renderMath()}
            {activeTab === "origins" && renderOrigins()}
            {activeTab === "credits" && renderCredits()}
          </div>
        </div>
      </div>
    </div>
  );
};
