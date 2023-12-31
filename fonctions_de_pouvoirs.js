var liste_selections = [];
var pouvoir = null;

function setPouvoir(x) {
    pouvoir = x;

    //Si le pouvoir n'est pas 0 ou 1, alors on n'a pas besoin de cliquer sur une tuile pour l'envoyer. On l'envoie donc maintenant.
    if(pouvoir > 1) {
        socket.emit("envoyer_action", getIdentifiantSecret(), pouvoir, []);
    }
}

/* Prend un hexagone D3.js correspondant à une tuile, et renvoie la position correspondante. */
/* Par exemple, si on lui passe la tuile de la deuxième ligne et troisième colonne, la       */
/* fonction renvoie [2, 3].                                                                  */
function extrairePosFromTuileD3(d) {
    let id = d.id.substring(1).split("-");
    return [Number(id[0]), Number(id[1])]
}

/* this correspond à l'hexagone */
function tuileCliquee() {
    let position = extrairePosFromTuileD3(this);
    let identifiant_secret = getIdentifiantSecret()
    if(pouvoir == 0) {
        socket.emit("envoyer_action", identifiant_secret, pouvoir, [position]);
        pouvoir = null;
    } if(pouvoir == 1) {
        liste_selections.push(position);
        if(liste_selections.length == 2) {
            socket.emit("envoyer_action", identifiant_secret, pouvoir, liste_selections);
            liste_selections = [];
            pouvoir = null;
        }
    }
}

/* Active ou désactive les boutons de pouvoir selon le score du client */
function updateBoutonsDePouvoir(liste_points) {
    let mes_points = liste_points[getNumeroJoueur()];
    activerBouton("bouton_pouvoir_0", (mes_points >= 40 ), "setPouvoir(0)");
    activerBouton("bouton_pouvoir_1", (mes_points >= 50 ), "setPouvoir(1)");
    activerBouton("bouton_pouvoir_2", (mes_points >= 75 ), "setPouvoir(2)");
    activerBouton("bouton_pouvoir_3", (mes_points >= 100), "setPouvoir(3)");
    activerBouton("bouton_pouvoir_4", (mes_points >= 130), "setPouvoir(4)");
    activerBouton("bouton_pouvoir_5", (mes_points >= 200), "setPouvoir(5)");
    activerBouton("bouton_pouvoir_6", (mes_points >= 500), "setPouvoir(6)");
    
}

/* Garantit que le pouvoir est valide (entre 0 et 6) et que la liste des positions a les   */
/* bonnes dimensions (deux chiffres par position, et 0, 1, ou 2 position selon le pouvoir) */
function verifierAction(action, nb_lignes, nb_colonnes) {
    let [numero_joueur, pouvoir, liste_positions, iteration] = action;
    //On vérifie que le pouvoir est entre 0 et 6
    if(pouvoir < 0 && pouvoir > 6) return false;
    
    //On ignore les listes de longueur plus grande que 2
    if(liste_positions.length > 2) return false;
    
    //On ignore les listes de position invalide
    for(let position of liste_positions) {
        if(position.length != 2 || position[0] < 0 || position[0] >= nb_lignes || position[1] < 0 || position[1] >= nb_colonnes) {
            return false;
        }
    }
    
    //On vérifie la taille de la liste des positions
    switch(pouvoir) {
        case 0 : return liste_positions.length == 1;
        case 1 : return liste_positions.length == 2;
        default: return liste_positions.length == 0;
    }
}

/* Garantit que l'utilisation de ce pouvoir est valide */
function executerAction(action, liste_terrain, liste_entites, liste_points) {
    let [numero_utilisateur, pouvoir, liste_positions, iteration] = action;
    let score = liste_points[numero_utilisateur];
    
    //On crée une liste contenant, pour chaque position de l'action, le  type de la tuile correspondant
    liste_types_tuiles = []
    for(let position of liste_positions) {
        liste_types_tuiles.push(getTypeTuile(liste_terrain, position));
    }
    
    switch(true) {
        case (pouvoir==0 && score >= 40 && liste_types_tuiles[0] == "P") :
                                            liste_points[numero_utilisateur] -= 40 ; TotalEnergies(liste_positions, liste_terrain); break;
        case (pouvoir==1 && score >= 50 && liste_types_tuiles.includes("R") && (liste_types_tuiles.includes("E") || liste_types_tuiles.includes("P"))) :
                                            liste_points[numero_utilisateur] -= 50 ; Abracadabra(liste_positions, liste_terrain); break;
        case (pouvoir==2 && score >= 75 ) : liste_points[numero_utilisateur] -= 75 ; ItsBigBrainTime(liste_entites, numero_utilisateur); break;
        case (pouvoir==3 && score >= 100) : liste_points[numero_utilisateur] -= 100; VisionEnsemble(liste_entites, numero_utilisateur); break;
        case (pouvoir==4 && score >= 130) : liste_points[numero_utilisateur] -= 130; ItsAHoax(liste_terrain); break;
        case (pouvoir==5 && score >= 200) : liste_points[numero_utilisateur] -= 200; DesormaisIneluctable(liste_entites, numero_utilisateur); break;
        case (pouvoir==6 && score >= 500) : liste_points[numero_utilisateur] -= 500; TheSuperintelligentWill(liste_entites); break;
    }
    
    //On met à jour les boutons de pouvoir (puisque les points ont changé)
    updateBoutonsDePouvoir(liste_points);
    //On redessine tout
    dessinerTout(liste_terrain, liste_entites, 10, 30)
}

function TotalEnergies(liste_positions, liste_terrain) {
    let [i, j] = liste_positions[0];
    liste_terrain[i][j] = "R"
}

function Abracadabra(liste_positions, liste_terrain) {
    permuter(liste_terrain, liste_positions[0], liste_positions[1]);
}

function ItsBigBrainTime(liste_entites, numero_utilisateur) {
    for(let entite of liste_entites) {
        if(entite.tribu == numero_utilisateur) {
            entite.intelligence += 25;
        }
    }
}

function VisionEnsemble(liste_entites, numero_utilisateur) {
    for(let entite of liste_entites) {
        if(entite.tribu == numero_utilisateur) {
            entite.perception += 1;
        }
    }
}

function ItsAHoax(liste_terrain) {
    for(let i=0; i<liste_terrain.length; i++) {
        for(let j=0; j<liste_terrain[0].length; j++) {
            if(liste_terrain[i][j] == "P" && randint(0, 1)) {
                liste_terrain[i][j] = "R";
            }
        }
    }
}

function DesormaisIneluctable(liste_entites, numero_utilisateur) {
    for(let i=liste_entites.length-1; i>=0; i--) {
        if(liste_entites[i].tribu != numero_utilisateur && randint(0, 1)) {
            liste_entites.splice(i, 1);
        }
    }
}

function TheSuperintelligentWill(liste_entites) {
    liste_entites.splice(0, liste_entites.length);
    
    enleverMenuCreationPartie();
    enleverMenuConnexion();
    enleverMenuPouvoirs();
    enleverMenuPrincipal();
    
    document.getElementById("tablier").style.display = "none";
    d3.select("#tablier").remove();
    
    ajouterMenuFinSuperintelligence();
}
