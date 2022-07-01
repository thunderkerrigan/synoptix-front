export interface ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;
  isSimilar: (comparedWord: ShadowWord) => boolean;
  isBetterFitted: (comparedWord: ShadowWord) => boolean;
  isBetterFittedOrSimilar: (comparedWord: ShadowWord) => boolean;
}

export class ShadowWord implements ShadowWord {
  id: number;
  closestWord: string;
  shadowWord: string;
  similarity: number;

  constructor(newWord: ShadowWord) {
    this.id = newWord.id;
    this.closestWord = newWord.closestWord;
    this.shadowWord = newWord.shadowWord;
    this.similarity = newWord.similarity;
  }
  isSimilar = (comparedWord: ShadowWord) =>
    this.similarity === comparedWord.similarity;
  isBetterFitted = (comparedWord: ShadowWord) =>
    this.similarity > comparedWord.similarity;
  isBetterFittedOrSimilar = (comparedWord: ShadowWord) =>
    this.similarity === 1 ||
    this.isSimilar(comparedWord) ||
    this.isBetterFitted(comparedWord);
}

export type Word = Record<string, number>;

export type ShadowWordsCloud = ShadowWord[][];

export interface RedactedGame {
  gameID: number;
  foundBy: number;
  redactedTitle: ShadowWordsCloud;
  redactedSynopsis: ShadowWordsCloud;
}

export interface LastWord {
  index: number;
  label: string;
  count: number;
}

export interface WordsDictionary {
  userID: string;
  gameID: number;
  foundScore: number;
  response: ShadowWordsCloud;
  summarizedGame: string;
  currentShadowWords: Record<string, ShadowWord>;
  allShadowWords: Record<string, ShadowWord>;
  foundBy: number;
  lastWords: LastWord[];
}

export const replaceWords =
  (allShadowWords: Record<string, ShadowWord>) =>
  (s: ShadowWord): ShadowWord => {
    const comparedWord = allShadowWords[s.id.toString()];
    if (comparedWord) {
      if (comparedWord.isBetterFittedOrSimilar(s)) {
        return comparedWord;
      } else {
        return s;
      }
    }
    return s;
  };
