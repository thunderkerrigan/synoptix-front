import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { hideRules } from "../redux/rulesSlice";
import { HelpCenter as HelpCenterIcon } from "@mui/icons-material";

const Rules = () => {
  const showRules = useAppSelector((state) => state.showRules);
  const dispatch = useAppDispatch();

  const closeRules = () => dispatch(hideRules());
  return (
    <Dialog open={showRules}>
      <DialogTitle>
        <Stack direction="row" display="flex" alignItems="center" spacing={1}>
          <HelpCenterIcon />
          <Typography variant="h6">Règles</Typography>
        </Stack>
      </DialogTitle>
      <List>
        <ListItem sx={{ fontWeight: "bold", textAlign: "justify" }}>
          Le but du jeu est de découvrir le film en révélant les mots qui
          composent son synopsis/résumé.
        </ListItem>
        <ListItem sx={{ textAlign: "justify" }}>
          Les mots corrects apparaîtront en clair au fur et à mesure que vous
          les essaierez. Ceux qui sont suffisamment proches resteront grisés
          avec un niveau de gris proportionnel à la proximité du mot réel dans
          le champ lexical.
        </ListItem>
        <ListItem sx={{ textAlign: "justify" }}>
          La forme masculine singulière d´un mot ou l'infinitif d´un verbe
          peuvent suffire à révéler ses formes féminines, plurielles ou
          conjuguées. Les majuscules ne sont pas nécessaires.
        </ListItem>
        <ListItem sx={{ textAlign: "justify" }}>
          Il vous faudra plus de 6 essais ; sans doute des dizaines. Le
          classement qui vous est donné en fin de partie est votre place dans la
          liste des joueurs qui ont trouvé le film du jour, il est indépendant
          du nombre d’essais.
        </ListItem>
        <ListItem sx={{ textAlign: "justify" }}>
          Il y a un nouveau film chaque jour à minuit heure française.
        </ListItem>
      </List>

      <Button
        sx={{
          width: "200px",
          margin: "auto",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
        variant="contained"
        onClick={closeRules}
      >
        J'ai compris!
      </Button>
    </Dialog>
  );
};

export default Rules;
