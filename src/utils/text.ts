import {
  ShadowWord,
  ShadowWordInterface,
  ShadowWordsCloud,
} from "../models/Word";

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
  currentShadowWords: Record<string, ShadowWordInterface>
): { newMatchedHints: string[]; newNearHints: string[] } => {
  let newMatchedHints: string[] = [];
  let newNearHints: string[] = [];
  wordClouds.forEach((row) => {
    row.forEach((s) => {
      const comparingWord = new ShadowWord(s);
      const matchedWordInterface = currentShadowWords[s.id.toString()];
      if (!matchedWordInterface) {
        return;
      }
      const matchedWord = new ShadowWord(matchedWordInterface);
      if (matchedWord && matchedWord.isSimilar(comparingWord)) {
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
  const matchedPerTen = Math.ceil((newMatchedHints / wordCount) * 10);

  const nearMatchedTen = Math.ceil((newNearHints / wordCount) * 10);
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
  console.log("summary", summary);
  return summary;
};

export const makeSummary = (
  wordClouds: ShadowWordsCloud
): { found: number; near: number; total: number } => {
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
  return { found: newMatchedHints, near: newNearHints, total: wordCount };
};
