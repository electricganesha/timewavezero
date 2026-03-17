export const createDate = (year: number, month: number, day: number): number => {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCFullYear(year);
  return d.getTime();
};

export const YEAR_MS = 31556952000;

export const MAJOR_EVENTS = [
  // Cosmological & Planetary (Billion Years)
  { label: "Big Bang Singularity", time: -22e9 * YEAR_MS },
  { label: "Formation of First Stars", time: -13.5e9 * YEAR_MS },
  { label: "Milky Way Galaxy Forms", time: -13.2e9 * YEAR_MS },
  { label: "Solar System Accumulation", time: -4.6e9 * YEAR_MS },
  { label: "Accretion of Moon", time: -4.5e9 * YEAR_MS },
  { label: "Hadean Ocean Formation", time: -4.4e9 * YEAR_MS },

  // Biological Evolution (Millions of Years)
  { label: "First Life (RNA World)", time: -4.1e9 * YEAR_MS },
  { label: "Photosynthesis Begins", time: -3.5e9 * YEAR_MS },
  { label: "Great Oxygenation Event", time: -2.4e9 * YEAR_MS },
  { label: "Eukaryotic Cells Evolve", time: -2.0e9 * YEAR_MS },
  { label: "Multicellular Life", time: -1.0e9 * YEAR_MS },
  { label: "Cambrian Explosion", time: -541e6 * YEAR_MS },
  { label: "First Land Plants", time: -450e6 * YEAR_MS },
  { label: "Great Permian Extinction", time: -252e6 * YEAR_MS },
  { label: "KT Extinction (Dinosaurs)", time: -65e6 * YEAR_MS },
  { label: "Rise of Mammals", time: -55e6 * YEAR_MS },
  { label: "Homo Sapiens Ancestors", time: -10e6 * YEAR_MS },

  // Pre-History & Foundations (Years Ago)
  { label: "Behavioral Modernity", time: -50000 * YEAR_MS },
  { label: "First Cave Paintings", time: -35000 * YEAR_MS },
  { label: "End of Last Glacial Max", time: -17000 * YEAR_MS },
  { label: "Gobekli Tepe (First Temple)", time: -11500 * YEAR_MS },
  { label: "Neolithic Revolution", time: -10000 * YEAR_MS },
  { label: "Sumerian Cuneiform Writing", time: createDate(-3200, 1, 1) },
  { label: "Unification of Upper/Lower Egypt", time: createDate(-3100, 1, 1) },
  { label: "Building of Great Pyramid", time: createDate(-2790, 1, 1) },
  { label: "Hammurabi's Code", time: createDate(-1750, 1, 1) },
  { label: "Bronze Age Collapse", time: createDate(-1177, 1, 1) },

  // Axial Age & Classical Era
  { label: "Golden Age of Greece / Buddha", time: createDate(-500, 1, 1) },
  { label: "Empire of Alexander the Great", time: createDate(-323, 6, 10) },
  { label: "Roman Empire Founded", time: createDate(-27, 1, 16) },
  { label: "Crucifixion of Christ", time: createDate(33, 4, 3) },
  { label: "Fall of Han Dynasty", time: createDate(220, 1, 1) },
  { label: "Council of Nicaea", time: createDate(325, 5, 20) },
  { label: "Fall of Roman Empire", time: createDate(476, 9, 4) },
  { label: "Birth of Prophet Mohammed", time: createDate(570, 1, 1) },

  // Middle Ages & Renaissance
  { label: "Battle of Hastings", time: createDate(1066, 10, 14) },
  { label: "First Crusade", time: createDate(1095, 11, 27) },
  { label: "Magna Carta Signed", time: createDate(1215, 6, 15) },
  { label: "Black Death Peak", time: createDate(1347, 6, 1) },
  { label: "Gutenberg Printing Press", time: createDate(1440, 1, 1) },
  { label: "Fall of Constantinople", time: createDate(1453, 5, 29) },
  { label: "Discovery of New World", time: createDate(1492, 10, 12) },
  { label: "Martin Luther's 95 Theses", time: createDate(1517, 10, 31) },

  // Enlightenment & Revolutions
  { label: "Newton's Principia", time: createDate(1687, 7, 5) },
  { label: "American Revolution", time: createDate(1776, 7, 4) },
  { label: "French Revolution", time: createDate(1789, 7, 14) },
  { label: "Industrial Revolution Peak", time: createDate(1850, 1, 1) },
  { label: "Darwin's Origin of Species", time: createDate(1859, 11, 24) },

  // 20th Century & Rapid Acceleration
  { label: "Einstein's Relativity", time: createDate(1915, 1, 1) },
  { label: "WWI Begins", time: createDate(1914, 7, 28) },
  { label: "Stock Exchange Crash", time: createDate(1929, 10, 29) },
  { label: "WWII Begins", time: createDate(1939, 9, 1) },
  { label: "Hiroshima", time: createDate(1945, 8, 6) },
  { label: "The Transistor Invented", time: createDate(1947, 12, 16) },
  { label: "DNA Double Helix", time: createDate(1953, 4, 25) },
  { label: "The 1960s Turning Point", time: createDate(1960, 1, 1) },
  { label: "Moon Landing", time: createDate(1969, 7, 20) },
  { label: "First Microprocessor (Intel 4004)", time: createDate(1971, 11, 15) },
  { label: "Invention of WWW", time: createDate(1989, 3, 12) },
  { label: "Human Genome Sequenced", time: createDate(2003, 4, 14) },
  { label: "9/11 Attacks", time: createDate(2001, 9, 11) },
  { label: "Birth of iPhone / Mobile Web", time: createDate(2007, 6, 29) },
  { label: "Timewave Zero Point", time: createDate(2012, 12, 21) },
  { label: "LLM Revolution (GPT-3)", time: createDate(2020, 6, 1) },
];
