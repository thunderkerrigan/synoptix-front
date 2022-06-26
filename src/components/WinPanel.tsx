import { Button, Checkbox, Collapse, Paper, Stack } from "@mui/material";
import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
interface WinPanelProps {
  foundTitle: boolean;
  foundScore: number;
  scoreCount: number;
  summarizedGame: string;
  showFullText: (show: boolean) => void;
}

const WinPanel = (props: WinPanelProps) => {
  const { foundScore, scoreCount, foundTitle, showFullText, summarizedGame } =
    props;
  const [showFullTextChecked, setShowFullTextChecked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const handleShowText = () => {
    setShowFullTextChecked(() => !showFullTextChecked);
    showFullText(!showFullTextChecked);
  };
  const sharingText = `J'ai trouvé le #Synoptix du jour en ${scoreCount} coup${
    scoreCount > 1 ? "s" : ""
  }!\n${summarizedGame}\nhttps://synoptix.thunderkerrigan.fr`;
  return (
    <Collapse in={foundTitle} timeout={800} unmountOnExit={true}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "#007308",
          color: "white",
          padding: 1,
        }}
      >
        <h1>BRAVO</h1>
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
        <Stack direction="row" justifyContent="flex-start" alignItems="center">
          <Checkbox checked={showFullTextChecked} onChange={handleShowText} />
          <span>Afficher le synopsis</span>
        </Stack>
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={2}
        >
          <CopyToClipboard text={sharingText} onCopy={() => setIsCopied(true)}>
            <Button
              sx={{ color: "inherit", fontWeight: "bold" }}
              color="primary"
            >
              partager
            </Button>
          </CopyToClipboard>
          <span>{isCopied ? <span>copié !</span> : null}</span>
        </Stack>
      </Paper>
    </Collapse>
  );
};

export default WinPanel;
