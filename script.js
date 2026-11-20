const LIEUX = {
"Plateau - Centre": [5.324,-4.016],
"Cocody - Saint Jean": [5.334,-3.996],
"Cocody - Riviera 2": [5.349,-3.973],
"Cocody - Riviera Palmeraie": [5.345,-3.95],
"Cocody - Deux Plateaux": [5.359,-4.008],
"Cocody - Angré": [5.369,-4.005],
"Yopougon - Selmer": [5.336,-4.085],
"Yopougon - Siporex": [5.328,-4.072],
"Yopougon - Niangon": [5.315,-4.095],
"Marcory - Zone 4": [5.295,-3.991],
"Marcory - INJS": [5.290,-3.970],
"Koumassi - Grand Carrefour": [5.293,-3.985],
"Treichville - Gare de Bassam": [5.305,-4.003],
"Adjamé - Liberté": [5.347,-4.022],
"Adjamé - Renault": [5.355,-4.015],
"Abobo - Gare": [5.423,-4.017],
"Abobo - PK18": [5.43,-4.03],
"Bingerville - Carrefour Marché": [5.354,-3.886],
"Port-Bouët - Phare": [5.256,-3.958],
"Port-Bouët - Aéroport FHB": [5.261,-3.926],
"Grand-Bassam - Carrefour Jeunesse": [5.205,-3.74]
};

// Fonction enrichie avec beaucoup plus de numéros de lignes SOTRA
function getBusInfo(depart, arrivee) {
    let d = depart.toLowerCase();
    let a = arrivee.toLowerCase();
    let quartierD = depart.split('-')[0].trim();
    let info = { numero: "Lignes multiples ou Navette Wibus", arret: `Arrêt principal de ${quartierD}` };

    const trajet = (zone1, zone2) => (d.includes(zone1) && a.includes(zone2)) || (d.includes(zone2) && a.includes(zone1));

    if(trajet("cocody", "plateau")) { info = { numero: "81, 82, ou 83", arret: "Arrêt Saint Jean / Cité Rouge / Gare Sud" }; }
    else if(trajet("cocody", "adjamé")) { info = { numero: "75, 77, ou 83", arret: "Arrêt Saint Jean / Liberté" }; }
    else if(trajet("abobo", "adjamé")) { info = { numero: "13, 14, 51 ou Gbaka", arret: "Gare d'Abobo / Renault" }; }
    else if(trajet("abobo", "plateau")) { info = { numero: "85, 21", arret: "Gare d'Abobo / Gare Nord Plateau" }; }
    else if(trajet("yopougon", "plateau")) { info = { numero: "39, 40, ou 27", arret: "Siporex / Selmer / Gare Nord" }; }
    else if(trajet("yopougon", "adjamé")) { info = { numero: "44 ou Gbaka", arret: "Siporex / 1er Pont / Liberté" }; }
    else if(trajet("plateau", "treichville")) { info = { numero: "04, 11, ou 12", arret: "Gare Sud / Gare de Bassam" }; }
    else if(trajet("marcory", "plateau")) { info = { numero: "11 ou 04", arret: "Grand Carrefour Marcory / INJS" }; }
    else if(trajet("koumassi", "plateau")) { info = { numero: "05, 26, ou 32", arret: "Grand Carrefour Koumassi / Gare Sud" }; }
    else if(trajet("port-bouët", "plateau")) { info = { numero: "06", arret: "Arrêt Phare / Marché de Port-Bouët" }; }
    else if(trajet("bingerville", "adjamé")) { info = { numero: "84 ou 73", arret: "Carrefour Marché Bingerville" }; }
    else if(trajet("adjamé", "plateau")) { info = { numero: "04, 14, ou 85", arret: "Liberté / Renault / Gare Nord" }; }
    else if(trajet("koumassi", "treichville")) { info = { numero: "05 ou 26", arret: "Grand Carrefour / Gare de Bassam" }; }
    
    return info;
}

setInterval(()=>{
    let d=new Date();
    let clock = document.getElementById("heureLive");
    if(clock) clock.innerText = d.toLocaleTimeString('fr-FR');
},1000);

let dernierLien=""; let maPos=null; let lastLat1,lastLon1,lastLat2,lastLon2,lastDepart,lastArrivee;

function remplir(){
    let departEl = document.getElementById("depart");
    let arriveeEl = document.getElementById("arrivee");
    
    if(!departEl || !arriveeEl) return;

    let opts=Object.keys(LIEUX).sort().map(n=>`<option value="${n}">${n}</option>`).join("");
    departEl.innerHTML=opts;
    arriveeEl.innerHTML=opts;
    departEl.value="Cocody - Saint Jean";
    arriveeEl.value="Plateau - Centre";
}

function rapide(d,a){ 
    document.getElementById("depart").value=d; 
    document.getElementById("arrivee").value=a; 
    calculer(); 
}

function maPosition(){
    if(!navigator.geolocation){ alert("GPS non supporté par ton navigateur."); return; }
    let selectDepart = document.getElementById("depart");
    let loadingOption = new Option("⏳ Recherche de ton adresse...", "loading");
    selectDepart.insertBefore(loadingOption, selectDepart.firstChild);
    selectDepart.value = "loading";

    navigator.geolocation.getCurrentPosition(async pos=>{ 
        maPos=[pos.coords.latitude,pos.coords.longitude]; 
        try {
            let res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${maPos[0]}&lon=${maPos[1]}`);
            let data = await res.json();
            let adresseExacte = data.display_name.split(',').slice(0, 2).join(', ');
            let nomAffichage = "📍 " + adresseExacte;

            selectDepart.remove(0); 
            let newOption = new Option(nomAffichage, nomAffichage);
            selectDepart.insertBefore(newOption, selectDepart.firstChild);
            selectDepart.value = nomAffichage;
            alert("✅ Ta position exacte a été trouvée :\n" + adresseExacte);
        } catch(e) {
            let nomAffichage = `📍 Ma position (${maPos[0].toFixed(4)}, ${maPos[1].toFixed(4)})`;
            selectDepart.remove(0); 
            let newOption = new Option(nomAffichage, nomAffichage);
            selectDepart.insertBefore(newOption, selectDepart.firstChild);
            selectDepart.value = nomAffichage;
        }
    },()=>{
        document.getElementById("depart").remove(0);
        alert("❌ Impossible de te localiser. Active ton GPS !");
    });
}

function openYango(){
    if(!lastLat1) return alert("Calcule d'abord ton trajet");
    alert("Ouverture de Yango...\nMets : "+lastDepart+" → "+lastArrivee+" pour voir le VRAI prix.");
    window.location.href = "yango://";
    setTimeout(function() { window.open("https://yango.com/", "_blank"); }, 1500);
}

function openInDrive(){
    alert("Ouverture de inDrive...\nPropose ton prix pour : "+lastDepart+" → "+lastArrivee);
    window.location.href = "indriver://";
    setTimeout(function() { window.open("https://indrive.com/", "_blank"); }, 1500);
}

async function calculer(){
    let dOrig=document.getElementById("depart").value;
    let aOrig=document.getElementById("arrivee").value;

    if(dOrig === "loading") return alert("Attends que ton adresse exacte soit trouvée !");

    let d=dOrig; let a=aOrig;
    let lat1,lon1; 

    if(dOrig.startsWith("📍") && maPos) { 
        lat1=maPos[0]; lon1=maPos[1]; 
    } else { 
        [lat1,lon1]=LIEUX[d]; 
        maPos = null; 
    }

    let [lat2,lon2]=LIEUX[a];
    lastLat1=lat1; lastLon1=lon1; lastLat2=lat2; lastLon2=lon2; lastDepart=d; lastArrivee=a;
    document.getElementById("resultCard").style.display="block";
    document.getElementById("resultat").innerText="⏳ Récupération des données EN TEMPS RÉEL...";
    document.getElementById("toutTransport").innerHTML="";
    let heureDebut = new Date();
    try{
        let res=await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
        let data=await res.json(); let route=data.routes[0];
        let dureeBase=Math.floor(route.duration/60); let dist=parseFloat((route.distance/1000).toFixed(1));

        let meteoTxt="🌦️ Météo indisponible";
        let tempReelle="--", pluieReelle=0, ventReel=0, heureMeteo="";
        try{
            let m=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat2}&longitude=${lon2}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`);
            let mj=await m.json(); let cur=mj.current;
            tempReelle=cur.temperature_2m; pluieReelle=cur.precipitation; ventReel=cur.wind_speed_10m; heureMeteo=cur.time;
            let emoji = cur.weather_code<=1?"☀️":cur.weather_code<=3?"⛅":cur.weather_code>=51&&cur.weather_code<=82?"🌧️":cur.weather_code>=95?"⛈️":"🌤️";
            let txt = cur.weather_code<=1?"Ensoleillé":cur.weather_code<=3?"Nuageux":cur.weather_code>=51&&cur.weather_code<=82?"Pluie en cours":cur.weather_code>=95?"Orage":"Beau temps";
            meteoTxt=`${emoji} TEMPS RÉEL à l'arrivée : ${txt}\n🌡️ Température ACTUELLE : ${tempReelle}°C\n🌧️ Pluie ACTUELLE : ${pluieReelle} mm\n💨 Vent : ${ventReel} km/h`;
        }catch(e){}

        let heure=new Date().getHours(); let coef=1.1, statut="🟡 TRAFIC FLUIDE";
        if((heure>=7&&heure<=9)||(heure>=17&&heure<=20)){ statut="🔴 GROS EMBOUTEILLAGE - HEURE DE POINTE"; coef=1.8; }
        else if(heure>=11&&heure<=13){ statut="🟠 TRAFIC MOYEN"; coef=1.3; }
        if(pluieReelle>0.5){ coef+=0.4; statut+=" + 🌧️ PLUIE = PLUS DE BOUCHONS"; }

        let dureeReelle=Math.floor(dureeBase*coef);
        dernierLien=`https://www.google.com/maps/dir/${lat1},${lon1}/${lat2},${lon2}`;
        document.getElementById("btnMaps").style.display="block";
        document.getElementById("lastUpdate").innerText = "Dernière mise à jour : " + heureDebut.toLocaleTimeString('fr-FR');

        document.getElementById("resultat").innerText=`✅ ${d.toUpperCase()} → ${a.toUpperCase()}\n\n📏 Distance EN DIRECT : ${dist} km\n⏰ Sans trafic : ${dureeBase} min\n${statut}\n🚗 Avec trafic MAINTENANT : ${dureeReelle} min\n\n${meteoTxt}`;

        let busInfos = getBusInfo(d, a);

        let html=`
        <div class="box box-taxi">
        <b>🚕 PRIX VTC (OUVRIR L'APP)</b><br>
        <span style="font-size:12px;color:#666">Clique sur l'application pour l'ouvrir directement sur ton téléphone.</span>

        <div class="taxi-btn" onclick="openYango()"><div><b>🟢 Yango</b><br><span style="font-size:12px;color:#666">Ouvrir l'application Yango</span></div><span class="prix-live">OUVRIR APP →</span></div>

        <div class="taxi-btn" onclick="openInDrive()"><div><b>🔵 InDrive</b><br><span style="font-size:12px;color:#666">Ouvrir l'application InDrive</span></div><span class="prix-live">NÉGOCIER →</span></div>

        <div style="margin-top:12px;background:#FFF3CD;padding:10px;border-radius:10px;font-size:13px">
        <b>💡 Estimation indicative :</b><br>
        Pour ${dist} km, le trajet te coûterait autour de ${Math.round((1000+dist*350+dureeReelle*50)/100)*100} FCFA en taxi compteur (wôro-wôro non inclus).
        </div>
        </div>

        <div class="box" style="background:#E8F5E9">
        <b>🚌 INFORMATIONS BUS SOTRA</b><br><br>
        📍 <b>Arrêt suggéré :</b> ${busInfos.arret}<br>
        🚍 <b>Numéro(s) de Bus :</b> <span style="font-weight:900; color:#d32f2f">${busInfos.numero}</span><br>
        💵 <b>Tarif SOTRA :</b> 200 FCFA ou 500 FCFA (Navette)<br><br>
        <span style="font-size:12px;color:#444"><i>Astuce : Les gbakas ou wôro-wôros sont aussi des alternatives rapides selon l'axe.</i></span>
        </div>`;

        document.getElementById("toutTransport").innerHTML=html;
    }catch(e){ 
        document.getElementById("resultat").innerText="❌ Pas de connexion internet."; 
    }
}

function ouvrirMaps(){ if(dernierLien) window.open(dernierLien,"_blank"); }

// Initialisation au chargement de la page
window.onload = () => {
    remplir(); 
    calculer();
    setInterval(()=>{ 
        let card = document.getElementById("resultCard");
        if(card && card.style.display==="block"){ calculer(); } 
    }, 60000);
};