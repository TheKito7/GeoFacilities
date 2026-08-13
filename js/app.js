// =====================================================================
// GEO-FACILITIES ENERGISA SERGIPE - CÓDIGO COMPLETO FINAL
// =====================================================================

// =====================================================================
// PARTE 1: INICIALIZAÇÃO DO MAPA E BASEMAP
// =====================================================================
const map = L.map('map').setView([-10.57, -37.38], 8);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO | Energisa Facilities',
    maxZoom: 19
}).addTo(map);

// =====================================================================
// PARTE 2: DEFINIÇÃO DOS ÍCONES CUSTOMIZADOS
// =====================================================================
const iconSizeConfig = {
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [1, -34]
};

const iconSubestacao = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2YyOTEwMCI+PHBhdGggZD0iTTEzIDEwaDdMMTAgMjJ2LTloN0wxNCAyaDd2OHoiLz48L3N2Zz4=',
    ...iconSizeConfig
});

const iconBaseOperacional = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNWJiNSI+PHBhdGggZD0iTTIwIDEwVjZIMzYvNGMtLjU1IDAtMSAuNDUtMSAxdi4wN0wyMCAxMFptMyAyaC05di0yaDlsLjcxIDEuNDJjLjE4LjM2LjI5Ljc2LjI5IDEuMTh2MS40QzIzIDE2LjQ1IDIyLjU1IDE3IDIyIDE3WiBtLTIgOEgyMHYtNGguOThMOSAxNFY4bC44NSAxLjcxaDE0Ljk4TDIyIDIwWk0yMCAxOXYyaC05di0yaDl6TTE3IDEwaC0zdi0yaDN2MnptMC00aC0zVjRoM3Yyem0tNSAwaC0zVjRoM3Yyem0tNSAwaC0zVjRoM3YyeiIvPjwvc3ZnPg==',
    ...iconSizeConfig
});

const iconSede = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNWJiNSI+PHBhdGggZD0iTTE5IDZIOXY0SDVYMTNoMTBWMTBIMTlWNlpNMTEgOGgydjJIMTFWOlpNMTcgOGgydjJIMTdWOlpNMyAxMEgxdjhoMlYxMFpNMjMgMTBIMjF2OGgyVjEwWk01IDE2SDN2NmgyVjE2Wk0yMSAxNkgyM3Y2SDIxVjE2Wk0xOSAxNEg5djhIMTNWMTdoMnY1SDE5VjE0Wk0xMSA4SDl2OEgxMVY4Wk0xNyA4SDE1djhIMTdWOHoiLz48L3N2Zz4=',
    ...iconSizeConfig
});

const iconAlmoxarifado = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU1NTU1NSI+PHBhdGggZD0iTTE4LjYyNCAxNi4wOTRDMTku1MTU4LjU1MTk4MS44OTQyMjIuMDA5MTk5LjY1NzgyMS44MDkxOTkuNjU3MDk2LjcwOTE5NS43MDcyMDQuNTUxOTUxLjQwNzgwMS40ODU4MTkuMzQ0MTExLjMxNjgxOS4xMDY4MTguMzUxODE5Ljk0NjE5NS43NDE5NTEuNTk3ODIwLjU5NzhDMTguNjI0IDE2LjA5NFoiLz48cGF0aCBkPSJNMjEgNmgydjEzLjVMMyAyMFY2aDJWNEg5VjZoNlY0SDIxdjJaTTUgOGgyVjZINVY4Wk0xMSA4aDJWNkgxMXY4Wk0xNyA4aDJWNkoxN3Y4WiIvPjwvc3ZnPg==',
    ...iconSizeConfig
});

const svgAgenciaAtendimento = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <style>
      .outline { stroke: #004b6b; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
      .orange { fill: #ed7523; }
      .blue { fill: #009ebf; }
      .white { fill: #ffffff; }
      .no-stroke { stroke: none; }
    </style>
  </defs>
  <rect x="20" y="55" width="125" height="135" class="outline white" />
  <path d="M 35 40 L 35 20 L 95 20 L 95 40 L 130 40 L 130 55 L 20 55 L 20 40 Z" class="outline orange" />
  <rect x="35" y="70" width="16" height="16" class="blue no-stroke" />
  <rect x="35" y="95" width="16" height="16" class="blue no-stroke" />
  <rect x="35" y="120" width="16" height="16" class="blue no-stroke" />
  <rect x="35" y="145" width="16" height="16" class="blue no-stroke" />
  <rect x="60" y="70" width="16" height="16" class="blue no-stroke" />
  <rect x="60" y="95" width="16" height="16" class="blue no-stroke" />
  <path d="M 120 40 H 175 A 10 10 0 0 1 185 50 V 80 A 10 10 0 0 1 175 90 H 145 L 130 105 V 90 H 120 A 10 10 0 0 1 110 80 V 50 A 10 10 0 0 1 120 40 Z" class="outline orange" />
  <circle cx="132" cy="65" r="4.5" class="white no-stroke" />
  <circle cx="147.5" cy="65" r="4.5" class="white no-stroke" />
  <circle cx="163" cy="65" r="4.5" class="white no-stroke" />
  <path d="M 70 155 C 70 125 80 115 100 115 C 120 115 130 125 130 155 Z" class="outline blue" />
  <polygon points="90 115, 110 115, 100 130" class="outline white" />
  <line x1="112" y1="135" x2="124" y2="135" class="outline" stroke-width="4"/>
  <path d="M 75 120 C 75 105 80 65 100 65 C 120 65 125 105 125 120 L 115 120 C 115 110 110 105 100 105 C 90 105 85 110 85 120 Z" class="outline orange" />
  <circle cx="100" cy="93" r="16" class="outline white" />
  <path d="M 84 91 C 90 80 96 83 100 85 C 104 83 110 80 116 91 C 115 71 85 71 84 91 Z" class="outline orange" />
  <circle cx="93" cy="90" r="2.5" class="outline" fill="#004b6b" stroke-width="0"/>
  <circle cx="107" cy="90" r="2.5" class="outline" fill="#004b6b" stroke-width="0"/>
  <path d="M 94 99 Q 100 105 106 99" fill="none" class="outline" stroke-width="3.5"/>
  <rect x="65" y="165" width="115" height="25" class="outline orange" />
  <rect x="55" y="155" width="135" height="10" class="outline orange" />
  <line x1="10" y1="190" x2="190" y2="190" class="outline" fill="none"/>
</svg>
`;

const iconAgencia = L.divIcon({
    html: svgAgenciaAtendimento,
    className: 'icone-transparente-svg', 
    iconSize: [45, 45], 
    iconAnchor: [22, 45], 
    popupAnchor: [0, -45] 
});

const mapIconTypes = {
    "Subestação": iconSubestacao,
    "Base Operacional": iconBaseOperacional,
    "Sede Administrative": iconSede,
    "Agência de Atendimento": iconAgencia,
    "Almoxarifado": iconAlmoxarifado
};

// =====================================================================
// PARTE 3: CARREGAMENTO DO MAPA DE MUNICÍPIOS (Energisa vs Sulgipe)
// =====================================================================
const municipiosNaoAtendidos = [
    "Arauá", "Boquim", "Cristinápolis", "Estância", 
    "Indiaroba", "Itabaianinha", "Pedrinhas", "Riachão do Dantas", 
    "Santa Luzia do Itanhy", "Tobias Barreto", "Tomar do Geru", "Umbaúba"
];

function normalizarNome(nome) {
    if (!nome) return "";
    return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const listaSulgipeFormatada = municipiosNaoAtendidos.map(normalizarNome);
const urlGeoJSON = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-28-mun.json';

fetch(urlGeoJSON)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function(feature) {
                const nomeMunicipio = normalizarNome(feature.properties.name);
                if (listaSulgipeFormatada.includes(nomeMunicipio)) {
                    return { fillColor: '#757474', color: '#555555', weight: 1, fillOpacity: 0.5 };
                } else {
                    return { fillColor: '#3c6846', color: '#1e7e34', weight: 1.5, fillOpacity: 0.3 };
                }
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindTooltip(`MUNICÍPIO: ${feature.properties.name}`);
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error("Erro ao carregar mapa:", error));

// =====================================================================
// PARTE 4: DADOS DAS AGÊNCIAS E BASES FÍSICAS (LISTAS COMPLETAS)
// =====================================================================
const dadosAgencias = [
    { "agencia": "Energisa - Amparo do São Francisco", "endereco": "R. General Teixeira, Lote 9, Amparo do São Francisco", "latitude": -10.2185, "longitude": -36.8335 },
    { "agencia": "Energisa - Aquidabã", "endereco": "Av. Parag, 2179 - Centro, Aquidabã", "latitude": -10.2806, "longitude": -37.0189 },
    { "agencia": "Energisa - Aracaju", "endereco": "R. Carlos Correia, 398 - Siqueira Campos, Aracaju", "latitude": -10.9261, "longitude": -37.0678 },
    { "agencia": "Energisa - Barra dos Coqueiros", "endereco": "Barra dos Coqueiros - SE", "latitude": -10.9091, "longitude": -37.0396 },
    { "agencia": "Energisa - Canindé de São Francisco", "endereco": "Canindé de São Francisco - SE", "latitude": -9.6457, "longitude": -37.7892 },
    { "agencia": "Energisa - Capela", "endereco": "Capela - SE", "latitude": -10.5050, "longitude": -37.0520 },
    { "agencia": "Energisa - Carmópolis", "endereco": "Carmópolis - SE", "latitude": -10.6480, "longitude": -36.9880 },
    { "agencia": "Energisa - Itabaiana", "endereco": "Itabaiana - SE", "latitude": -10.6850, "longitude": -37.4250 },
    { "agencia": "Energisa - Lagarto", "endereco": "Lagarto - SE", "latitude": -10.9170, "longitude": -37.6650 },
    { "agencia": "Energisa - Laranjeiras", "endereco": "Laranjeiras - SE", "latitude": -10.8030, "longitude": -37.1720 },
    { "agencia": "Energisa - Nossa Senhora da Glória", "endereco": "Nossa Senhora da Glória - SE", "latitude": -10.2180, "longitude": -37.4200 },
    { "agencia": "Energisa - Nossa Senhora do Socorro", "endereco": "Nossa Senhora do Socorro - SE", "latitude": -10.8540, "longitude": -37.1260 },
    { "agencia": "Energisa - Propriá", "endereco": "Propriá - SE", "latitude": -10.2100, "longitude": -36.8400 },
    { "agencia": "Energisa - São Cristóvão", "endereco": "São Cristóvão - SE", "latitude": -11.0140, "longitude": -37.2060 },
    { "agencia": "Energisa - Simão Dias", "endereco": "Simão Dias - SE", "latitude": -10.7380, "longitude": -37.8100 },
    { "agencia": "Energisa - Poço Verde", "endereco": "R. José Vieira de Santana, 129 - Centro, Poço Verde", "latitude": -10.7103, "longitude": -38.1814 },
    { "agencia": "Energisa - Porto da Folha", "endereco": "Pç. Padre Oliveira, 889 - Centro, Porto da Folha", "latitude": -9.9144, "longitude": -37.2758 }
];

const subestacoesEnergisa = [
    { "agencia": "Subestação - Aracaju (ARJ)", "endereco": "Av. Chanceler Osvaldo Aranha, Veneza, Aracaju", "latitude": -10.9250, "longitude": -37.0760 },
    { "agencia": "Subestação - Atalaia (ATL)", "endereco": "Atalaia, Aracaju", "latitude": -10.9850, "longitude": -37.0490 },
    { "agencia": "Subestação - Cabrita (CBT)", "endereco": "Zona Rural, São Cristóvão", "latitude": -10.9700, "longitude": -37.2100 },
    { "agencia": "Subestação - Coroa do Meio (CME)", "endereco": "Coroa do Meio, Aracaju", "latitude": -10.9630, "longitude": -37.0430 },
    { "agencia": "Subestação - Distrito Industrial (DIN)", "endereco": "Distrito Industrial, Aracaju", "latitude": -10.9300, "longitude": -37.0850 },
    { "agencia": "Subestação - Eduardo Gomes (EDG)", "endereco": "Eduardo Gomes, São Cristóvão", "latitude": -10.9000, "longitude": -37.1000 },
    { "agencia": "Subestação - Jardins (JAR)", "endereco": "Jardins, Aracaju", "latitude": -10.9450, "longitude": -37.0550 },
    { "agencia": "Subestação - Marcos Freire (MKF)", "endereco": "Marcos Freire, Socorro", "latitude": -10.8650, "longitude": -37.0800 },
    { "agencia": "Subestação - Socorro (SOC)", "endereco": "Socorro - SE", "latitude": -10.8500, "longitude": -37.1200 },
    { "agencia": "Subestação - Itabaiana (ITB)", "endereco": "Itabaiana - SE", "latitude": -10.6800, "longitude": -37.4200 },
    { "agencia": "Subestação - Lagarto (LAG)", "endereco": "Lagarto - SE", "latitude": -10.9100, "longitude": -37.6600 },
    { "agencia": "Subestação - Glória (GLO)", "endereco": "N. Sra. da Glória - SE", "latitude": -10.2150, "longitude": -37.4150 },
    { "agencia": "Subestação - Propriá (PRO)", "endereco": "Propriá - SE", "latitude": -10.2050, "longitude": -36.8350 },
    { "agencia": "Subestação - Urubu (URB)", "endereco": "Urubu, Sergipe", "latitude": -10.8980, "longitude": -37.0500 },
    { "agencia": "Subestação - Xingó (XNG)", "endereco": "Canindé de São Francisco", "latitude": -9.6240, "longitude": -37.7910 }
];

// 1º PASSO: Mapeia as Agências
const basesFisicasEnergisa = dadosAgencias.map(item => {
    return {
        nome: item.agencia,
        endereco: item.endereco,
        lat: item.latitude,
        lng: item.longitude,
        tipo: "Agência de Atendimento",
        status: "Ativo"
    };
});

// 2º PASSO: Mapeia as Subestações
const basesSubestacoes = subestacoesEnergisa.map(item => {
    return {
        nome: item.agencia,
        endereco: item.endereco,
        lat: item.latitude,
        lng: item.longitude,
        tipo: "Subestação", 
        status: "Ativo"
    };
});

// 3º PASSO: Junta as duas listas 
const todasBasesFisicas = basesFisicasEnergisa.concat(basesSubestacoes);


// =====================================================================
// PARTE 5: RENDERIZAÇÃO DOS PINS E CRIAÇÃO DO MENU DE FILTROS
// =====================================================================
const camadas = {
    "Subestações": L.layerGroup().addTo(map),
    "Bases Operacionais": L.layerGroup().addTo(map),
    "Sedes Administrativas": L.layerGroup().addTo(map),
    "Agências de Atendimento": L.layerGroup().addTo(map),
    "Almoxarifados": L.layerGroup().addTo(map)
};

const mapTypeToLayer = {
    "Subestação": camadas["Subestações"],
    "Base Operacional": camadas["Bases Operacionais"],
    "Sede Administrative": camadas["Sedes Administrativas"],
    "Agência de Atendimento": camadas["Agências de Atendimento"],
    "Almoxarifado": camadas["Almoxarifados"]
};

// Aqui usamos "todasBasesFisicas" para varrer toda a lista combinada
todasBasesFisicas.forEach(base => {
    // Define o ícone correto
    const iconeCorreto = mapIconTypes[base.tipo] || new L.Icon.Default();
    
    // Cria o marcador
    const marker = L.marker([base.lat, base.lng], { icon: iconeCorreto });
    
    const popupContent = `
        <div class="popup-facilities">
            <h3>${base.nome}</h3>
            <b>Tipo:</b> ${base.tipo}<br>
            <b>Status:</b> ${base.status}<br>
            <b>Endereço:</b> ${base.endereco}<br>
            <hr>
            <small>Adicionar ocorrência/comentário:</small>
            <textarea id="comentario-${base.nome.replace(/\s+/g, '')}" placeholder="Ex: Infiltração na sala 2..."></textarea>
            <button onclick="salvarComentario('${base.nome}')">Registrar</button>
        </div>
    `;
    
    marker.bindPopup(popupContent);

    // Adiciona o marcador ao respectivo LayerGroup
    const camadaDestino = mapTypeToLayer[base.tipo] || camadas["Agências de Atendimento"];
    marker.addTo(camadaDestino);
});

// Adiciona os controles (filtros) ao mapa
L.control.layers(
    null,       
    camadas,    
    { 
        position: 'topright',
        collapsed: false      
    }
).addTo(map);

// =====================================================================
// PARTE 6: INTERAÇÕES - CAPTURA DE COORDENADAS E SALVAMENTO DE COMENTÁRIOS
// =====================================================================
const infoWindow = L.popup();

function onClickMap(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    infoWindow
        .setLatLng(e.latlng)
        .setContent(`
            <div style="text-align:center; padding: 5px;">
                <b>Nova Unidade?</b><br>
                Use estas coordenadas no seu cadastro:<br>
                <code style="background-color: #eee; padding: 2px 5px; font-size: 1.1em; display:inline-block; margin-top:5px;">
                    ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </code>
            </div>
        `)
        .openOn(map);

    console.log(`Coordenadas do clique: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
}

map.on('click', onClickMap);

window.salvarComentario = function(nomeBase) {
    const idTextarea = `comentario-${nomeBase.replace(/\s+/g, '')}`;
    const textarea = document.getElementById(idTextarea);
    
    if(!textarea || textarea.value.trim() === "") {
        alert("Digite um comentário antes de salvar.");
        return;
    }
    
    alert(`Comentário para a ${nomeBase} salvo com sucesso:\n\n"${textarea.value}"`);
    textarea.value = "";
};

// =====================================================================
// INTERATIVIDADE DO MENU LATERAL
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnTerceirizados = document.getElementById('btn-terceirizados');
    const listaTerceirizados = document.getElementById('lista-terceirizados');

    if (btnTerceirizados && listaTerceirizados) {
        btnTerceirizados.addEventListener('click', (e) => {
            e.preventDefault(); 
            // Alterna a classe que mostra a lista
            listaTerceirizados.classList.toggle('mostrar');
            // Alterna a classe que gira a setinha do botão
            btnTerceirizados.classList.toggle('ativo');
        });
    }
});