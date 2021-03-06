import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Collapse,
  Divider,
  keyframes,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Share as ShareIcon } from "@mui/icons-material";
import { useAppSelector } from "../hooks/useRedux";

interface WinPanelProps {
  foundTitle: boolean;
  showFullText: (show: boolean) => void;
}

const rainbowKeyFrames = keyframes`
0% {
  background-position: 0% 50%;
}
50% {
  background-position: 100% 25%;
}
100% {
  background-position: 0% 50%;
}
`;
const WinPanel = (props: WinPanelProps) => {
  const { foundTitle, showFullText } = props;
  const { foundScore, summarizedGame, lastWords, gameNumber } = useAppSelector(
    (state) => state.game
  );
  const scoreCount = lastWords.length;
  const [showFullTextChecked, setShowFullTextChecked] = useState(false);
  const [isExpanded, setExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const handleShowText = () => {
    setShowFullTextChecked(() => !showFullTextChecked);
    showFullText(!showFullTextChecked);
  };
  const sharingText = `J'ai trouvé le #Synoptix n°${gameNumber} en ${scoreCount} coup${
    scoreCount > 1 ? "s" : ""
  }!\n${summarizedGame}\nhttps://synoptix.thunderkerrigan.fr`;
  return (
    <Collapse
      sx={{
        margin: "auto",
        maxWidth: "360px",
      }}
      in={foundTitle}
      timeout={800}
      unmountOnExit={true}
    >
      <Accordion
        sx={{
          backgroundColor: "#007308",
          color: "white",
        }}
        expanded={isExpanded}
        onChange={() => setExpanded((prev) => !prev)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
          aria-controls="panel-win-content"
          id="panel-win-header"
        >
          <Typography
            variant="h3"
            sx={{
              backgroundSize: "800% 800%",
              backgroundImage:
                "repeating-linear-gradient(45deg, violet, indigo, blue, green, yellow, orange, red, violet)",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: `1s linear 0s infinite normal none running ${rainbowKeyFrames}`,
            }}
          >
            BRAVO
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Divider />

          <p>
            <span>vous êtes </span>
            <b>
              {foundScore}
              <sup>e</sup>
            </b>
            <span> à avoir trouvé le film, en </span>
            <b>{`${scoreCount} coup${scoreCount > 1 ? "s" : ""}`}</b>
          </p>
          <p>Résumé:</p>
          <p>{summarizedGame}</p>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Checkbox checked={showFullTextChecked} onChange={handleShowText} />
            <span>Afficher le synopsis</span>
          </Stack>
          <Divider variant="middle" />
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <CopyToClipboard
              text={sharingText}
              onCopy={() => setIsCopied(true)}
            >
              <Button
                sx={{ color: "inherit", fontWeight: "bold" }}
                color="primary"
                // variant="outlined"
                startIcon={<ShareIcon />}
              >
                partager
              </Button>
            </CopyToClipboard>
            <span>{isCopied ? <span>copié !</span> : null}</span>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Collapse>
  );
};

export default WinPanel;
