import { t, f, v } from "./src/engine/timewaveEngine";

console.log("--- Time Wave Zero Verification ---");

const tests = [
  { x: 0, expected: 0 },
  { x: 1, expected: 0.0000036160151 },
  { x: 9.5, expected: 0.000047385693 },
];

tests.forEach(({ x, expected }) => {
  const actual = t(x);
  const diff = Math.abs(actual - expected);
  console.log(`x = ${x.toString().padEnd(3)}:`);
  console.log(`  Actual:   ${actual.toFixed(15)}`);
  console.log(`  Expected: ${expected.toFixed(15)}`);
  console.log(`  Diff:     ${diff.toFixed(15)}`);
  if (diff < 1e-10) {
    console.log("  \x1b[32mPASS\x1b[0m");
  } else {
    console.log("  \x1b[31mFAIL\x1b[0m");
  }
});
