import { ShadowWord, ShadowWordsCloud } from "../models/Word";

export const makeHintsCountText = (
  greenHints: string[],
  orangeHints: string[]
): string => {
  const greenText = concatenateHintsCount(greenHints);
  const orangeText = concatenateHintsCount(orangeHints);
  return `${greenText}\n${orangeText}`;
};

const concatenateHintsCount = (hints: string[], limit: number = 10): string => {
  const firstRow = hints.slice(0, limit);
  const secondRow = hints.slice(limit, hints.length);
  return `${firstRow.join("")}${
    secondRow.length > 0 ? `+${secondRow.length}` : ""
  }`;
};

export const countHints = (
  wordClouds: ShadowWordsCloud,
  currentShadowWords: Record<string, ShadowWord>
): { newMatchedHints: string[]; newNearHints: string[] } => {
  let newMatchedHints: string[] = [];
  let newNearHints: string[] = [];
  wordClouds.forEach((row) => {
    row.forEach((s) => {
      const matchedWord = currentShadowWords[s.id.toString()];
      if (matchedWord && matchedWord.isSimilar(s)) {
        if (matchedWord.similarity === 1) {
          newMatchedHints.push("🟩");
        } else {
          newNearHints.push("🟧");
        }
      }
    });
  });
  return { newMatchedHints, newNearHints };
};
