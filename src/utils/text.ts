import { ShadowWord, ShadowWordsCloud } from "../models/Word";

export const makeHintsCountText = (
  greenHints: string[],
  orangeHints: string[]
): string => {
  const greenText = concatenateHintsCount(greenHints);
  const orangeText = concatenateHintsCount(orangeHints);
  if (greenText.length === 0 && orangeText.length === 0) {
    return "🟥";
  }
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

export const summarizedGame = (wordClouds: ShadowWordsCloud): string => {
  let newMatchedHints = 0;
  let newNearHints = 0;
  let wordCount = 0;
  wordClouds.forEach((row) => {
    row.forEach((s) => {
      if (s.id !== -1) {
        wordCount++;
        if (s.similarity === 1) {
          newMatchedHints++;
        } else if (s.similarity > 0) {
          newNearHints++;
        }
      }
    });
  });
  let summary = "";
  const matchedPerTen = Math.round((newMatchedHints / wordCount) * 10);

  const nearMatchedTen = Math.round((newNearHints / wordCount) * 10);
  const notMatchedTen = 10 - matchedPerTen - nearMatchedTen;
  for (let i = 0; i < notMatchedTen; i++) {
    summary += "🟥";
  }
  for (let i = 0; i < nearMatchedTen; i++) {
    summary += "🟧";
  }
  for (let i = 0; i < matchedPerTen; i++) {
    summary += "🟩";
  }
  return summary;
};
