export interface ShadowWord {
    id: number
    closestWord: string
    shadowWord: string
    similarity: number
    isSimilar: (comparedWord: ShadowWord) => boolean
    isBetterFitted: (comparedWord: ShadowWord) => boolean
    isBetterFittedOrSimilar: (comparedWord: ShadowWord) => boolean
}

export class ShadowWord implements ShadowWord {
    id: number
    closestWord: string
    shadowWord: string
    similarity: number

    constructor(newWord: ShadowWord) {
        this.id = newWord.id
        this.closestWord = newWord.closestWord
        this.shadowWord = newWord.shadowWord
        this.similarity = newWord.similarity
    }
    isSimilar = (comparedWord: ShadowWord) => comparedWord.similarity === 1
    isBetterFitted = (comparedWord: ShadowWord) =>
        this.similarity > comparedWord.similarity
    isBetterFittedOrSimilar = (comparedWord: ShadowWord) =>
        this.isSimilar(comparedWord) || this.isBetterFitted(comparedWord)
}

export type Word = Record<string, number>

export type ShadowWordsCloud = ShadowWord[][]

export interface RedactedGame {
    gameID: number
    redactedTitle: ShadowWordsCloud
    redactedSynopsis: ShadowWordsCloud
}

export interface WordsDictionary {
    gameID: number
    currentShadowWords: Record<string, ShadowWord>
    allShadowWords: Record<string, ShadowWord>
}

export const replaceWords =
    (dictionaries: WordsDictionary) =>
    (s: ShadowWord): ShadowWord => {
        const comparedWord = dictionaries.allShadowWords[s.id.toString()]
        if (comparedWord) {
            if (comparedWord.isBetterFittedOrSimilar(s)) {
                console.log(
                    `${s.closestWord} (${s.similarity}) is replaced by ${comparedWord.closestWord}  (${comparedWord.similarity})`
                )
                return comparedWord
            } else {
                return s
            }
        }
        return s
    }
