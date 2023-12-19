/* Prend un rayon, une ligne, une colonne, et le rayon des tuiles, et génère un hexagone sérialisé correspondant.   */
/* Par exemple, si l'on veut faire une entité de rayon 10 à la ligne 0 et colonne 1, et que les tuiles ont un rayon */
/* de 30, on fait hexagoneSerialise(10, 0, 1, 30). On obtient un hexagone sérialisé (une chaîne de caractères)      */
function hexagoneSerialise(rayon, rayon_tuiles, position) {
    let [ligne, colonne] = position;
    let distance_tuiles = rayon_tuiles*Math.cos(Math.PI / 6); // Distance entre le centre d'une tuile et le centre de ses côtés
    
    let serialized = "";
    for (let i = 0; i < 6; i++) {
        // On crée l'hexagone autour de (0, 0), puis on le positionne, puis on arrondit, puis on le décale du bord
        let x = Math.sin(i * Math.PI / 3) * rayon; x += distance_tuiles * (1 + 2*colonne + ligne); x = Math.round(x*100)/100; x+=10;
        let y = Math.cos(i * Math.PI / 3) * rayon; y += rayon_tuiles*(1 + 1.5*ligne)             ; y = Math.round(y*100)/100; y+=10;
        
        // On sérialise l'hexagone
        if(i == 0) serialized += "M" + x + "," + y + " L";
        else       serialized +=       x + "," + y + " ";
    }
    serialized += "Z"
    
    return serialized
}


/* Crée une toile. Il ne faut pas appeler cette fonction plusieurs fois. */
function preparerTablier(nb_lignes, nb_colonnes, rayon_entites, rayon_tuiles) {
    
    let distance_tuiles = rayon_tuiles*Math.cos(Math.PI / 6);
    
    d3.select("#tablier").append("svg")
    .attr("width", (nb_colonnes*2 + (nb_lignes-1))*distance_tuiles + 20)
    .attr("height", (nb_lignes*1.5 + 0.5)*rayon_tuiles + 20);
    
    d3.select("svg").append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "pink")
    
    dessiner(rayon_entites, rayon_tuiles);
    
}


/* Efface tout et redessine tout*/
function dessiner(liste_terrain, liste_entites, rayon_entites, rayon_tuiles) {
    d3.selectAll("path").remove(); // On enlève tous les hexagones
    dessinerTerrain(liste_terrain, rayon_tuiles); // On redessine le terrain
    dessinerEntites(liste_entites, rayon_entites, rayon_tuiles) // On redessine les entités
}



function getCouleur(i) {
    switch(i) {
        case  0 : return "red"   ;
        case  1 : return "purple";
        case  2 : return "orange";
        case  3 : return "yellow";
        case "E": return "blue"  ;
        case "P": return "green" ;
        case "R": return "grey"  ;
    }
}



/* Dessine uniquement le terrain (sans effacer) */
function dessinerTerrain(liste_terrain, rayon) {
    let [nb_lignes, nb_colonnes] = [liste_terrain.length, liste_terrain[0].length]
    for (let i=0; i < nb_lignes; i++) {
        for (let j=0; j < nb_colonnes; j++) {
            d3.select("svg")
            .append("path")
            .attr("d", hexagoneSerialise(rayon, rayon, [i, j]))
            .attr("stroke", "black")
            .attr("fill", getCouleur(liste_terrain[i][j]))
            .attr("id", "t" + i + "-" + j) // t pour "tuile"
            .on("click", function(d) {
                //On verra plus tard ce qu'il se passe quand on clique
            });
        }
    }
}


/* Dessine uniquement les entités (sans effacer) */
function dessinerEntites(liste_entites, rayon, rayon_tuiles) {
    for(let i=0; i<liste_entites.length; i++) { // Pour chaque tribu
        for(let j in liste_entites[i]) { // Pour chaque entité
            d3.select("svg")
            .append("path")
            .attr("d", hexagoneSerialise(rayon, rayon_tuiles, liste_entites[i][j].position))
            .attr("stroke", "white")
            .attr("fill", getCouleur(i))
            .attr("id", "e" + i + "-" + j); // e pour "entité"
        }
    }
}

//module.exports = {dessiner};