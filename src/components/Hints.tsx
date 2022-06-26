import React, { Fragment } from "react";
import { ShadowWord, ShadowWordsCloud } from "../models/Word";
import { countHints, makeHintsCountText } from "../utils/text";

interface HintsProps {
  text: ShadowWordsCloud;
  currentShadowWords: Record<string, ShadowWord>;
  lastWord: string;
  isScoreLoading: boolean;
}

const Hints = (props: HintsProps) => {
  const { text, currentShadowWords, lastWord, isScoreLoading } = props;
  if (!lastWord || isScoreLoading) {
    return <Fragment />;
  }
  const { newMatchedHints, newNearHints } = countHints(
    text,
    currentShadowWords
  );
  const fullHintsRow = makeHintsCountText(newMatchedHints, newNearHints);
  return (
    <p>
      <b>{`${lastWord}: ${fullHintsRow}`}</b>
    </p>
  );
};

export default Hints;
