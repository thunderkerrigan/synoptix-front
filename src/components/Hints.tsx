import React, { Fragment, useDeferredValue } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { ShadowWordsCloud } from "../models/Word";
import { updateLastWords } from "../redux/gameSlice";
import { countHints, makeHintsCountText } from "../utils/text";

interface HintsProps {
  text: ShadowWordsCloud;
  isScoreLoading: boolean;
}

const Hints = (props: HintsProps) => {
  const { text, isScoreLoading } = props;
  const { currentShadowWords, lastWord } = useAppSelector(
    (state) => state.game
  );
  const deferredLastWord = useDeferredValue(lastWord);
  const dispatch = useAppDispatch();
  if (!lastWord || isScoreLoading) {
    return <Fragment />;
  }
  const { newMatchedHints, newNearHints } = countHints(
    text,
    currentShadowWords
  );
  const fullHintsRow = makeHintsCountText(newMatchedHints, newNearHints);
  dispatch(
    updateLastWords({
      word: deferredLastWord,
      matchCount: newMatchedHints.length,
      nearCount: newNearHints.length,
    })
  );

  return (
    <p>
      <b>{`${lastWord}: ${fullHintsRow}`}</b>
    </p>
  );
};

export default Hints;
