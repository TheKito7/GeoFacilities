// =====================================================================
// GEO-FACILITIES ENERGISA SERGIPE - VERSÃO INTEGRADA COM CAPTURA DE COORDENADAS
// =====================================================================
console.log(">>> O ARQUIVO APP.JS FOI CARREGADO COM SUCESSO! <<<");
// 1. Inicializa o mapa centralizado no estado de Sergipe
const map = L.map('map').setView([-10.5741, -37.3857], 8.5);

// 2. Adiciona o mapa de fundo (ruas e estradas)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap | Energisa Facilities'
}).addTo(map);

// =====================================================================
// PARTE 1: DEFINIÇÃO DOS ÍCONES CUSTOMIZADOS (Base64)
// Mantendo os ícones temáticos nas cores Energisa: Azul e Laranja.
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

const iconAgencia = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2YyOTEwMCI+PHBhdGggZD0iTTEyIDJjMS4xIDAgMiAuOSAyIDJzLS45IDItMiAyLTIuMS0uOS0yLjEtMmMwLTEuMS45LTIgMi0yem05IDdIMXYyaDIydi0yek0xMS44NCAxNC43M2MtLjI4LS4wNy0uNTUtLjE4LS44LS4zMkw4IDEyLjhWMTVIMXY7aDF2LTdoNmgydjEwSDIydi03SDExLjg0eiIvPjwvc3ZnPg==',
    ...iconSizeConfig
});

const iconAlmoxarifado = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU1NTU1NSI+PHBhdGggZD0iTTE4LjYyNCAxNi4wOTRDMTku1MTU4LjU1MTk4MS44OTQyMjIuMDA5MTk5LjY1NzgyMS44MDkxOTkuNjU3MDk2LjcwOTE5NS43MDcyMDQuNTUxOTUxLjQwNzgwMS40ODU4MTkuMzQ0MTExLjMxNjgxOS4xMDY4MTguMzUxODE5Ljk0NjE5NS43NDE5NTEuNTk3ODIwLjU5NzhDMTguNjI0IDE2LjA5NFoiLz48cGF0aCBkPSJNMjEgNmgydjEzLjVMMyAyMFY2aDJWNEg5VjZoNlY0SDIxdjJaTTUgOGgyVjZINVY4Wk0xMSA4aDJWNkgxMXY4Wk0xNyA4aDJWNkoxN3Y4WiIvPjwvc3ZnPg==',
    ...iconSizeConfig
});

const mapIconTypes = {
    "Subestação": iconSubestacao,
    "Base Operacional": iconBaseOperacional,
    "Sede Administrative": iconSede,
    "Agência de Atendimento": iconAgencia,
    "Almoxarifado": iconAlmoxarifado
};

// =====================================================================
// PARTE 2: CARREGAMENTO DO MAPA DE MUNICÍPIOS (Energisa Verde vs Sulgipe Cinza)
// =====================================================================

// Lista da área de concessão da Sulgipe
const municipiosNaoAtendidos = [
    "Arauá", "Boquim", "Cristinápolis", "Estância", 
    "Indiaroba", "Itabaianinha", "Pedrinhas", "Riachão do Dantas", 
    "Santa Luzia do Itanhy", "Tobias Barreto", "Tomar do Geru", "Umbaúba"
];

// Função que remove acentos e deixa tudo minúsculo para garantir a comparação
function normalizarNome(nome) {
    if (!nome) return "";
    return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const listaSulgipeFormatada = municipiosNaoAtendidos.map(normalizarNome);

// MUDANÇA AQUI: Nova fonte de dados que GARANTE o envio dos nomes das cidades
const urlGeoJSON = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-28-mun.json';

fetch(urlGeoJSON)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: function(feature) {
                // Agora sim, feature.properties.name tem o nome correto
                const nomeMunicipio = normalizarNome(feature.properties.name);
                
                // Compara as listas
                if (listaSulgipeFormatada.includes(nomeMunicipio)) {
                    // Municípios Sulgipe -> Cinza
                    return { fillColor: '#757474', color: '#555555', weight: 1, fillOpacity: 0.5 };
                } else {
                    // Municípios Energisa -> Verde
                    return { fillColor: '#3c6846', color: '#1e7e34', weight: 1.5, fillOpacity: 0.3 };
                }
            },
            onEachFeature: function (feature, layer) {
                // O nome agora vai aparecer corretamente ao passar o mouse
                if (feature.properties && feature.properties.name) {
                    layer.bindTooltip(`MUNICÍPIO: ${feature.properties.name}`);
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error("Erro ao carregar mapa:", error));
// =====================================================================
// PARTE 3: BASE DE DADOS DE EXEMPLO DE IMÓVEIS (Sergipe)
// =====================================================================
const basesFisicasEnergisa = [
    { nome: "Sede Administrativa Sergipe", lat: -10.9416, lng: -37.0673, tipo: "Sede Administrative", status: "Operacional" },
    { nome: "Base Operacional Aracaju Norte", lat: -10.9011, lng: -37.0712, tipo: "Base Operacional", status: "Operacional" },
    { nome: "Subestação Inácio Barbosa", lat: -10.9431, lng: -37.0660, tipo: "Subestação", status: "Manutenção Preventiva" },
    { nome: "Agência de Atendimento Centro", lat: -10.9108, lng: -37.0452, tipo: "Agência de Atendimento", status: "Operacional" },
    { nome: "Agência CEAC RioMar", lat: -10.9318, lng: -37.0461, tipo: "Agência de Atendimento", status: "Operacional" },
    { nome: "Subestação Itabaiana I", lat: -10.6830, lng: -37.4285, tipo: "Subestação", status: "Operacional" },
    { nome: "Base Operacional Sul", lat: -11.2710, lng: -37.4320, tipo: "Base Operacional", status: "Reforma Pendente" },
    { nome: "Agência Propriá", lat: -10.2091, lng: -36.8391, tipo: "Agência de Atendimento", status: "Operacional" }
];

// =====================================================================
// PARTE 4: RENDERIZAÇÃO DOS PINS COM OS ÍCONES CUSTOMIZADOS
// =====================================================================
basesFisicasEnergisa.forEach(base => {
    const iconeCorreto = mapIconTypes[base.tipo] || iconSede;
    const marker = L.marker([base.lat, base.lng], { icon: iconeCorreto }).addTo(map);
    
    const popupContent = `
        <div class="popup-facilities">
            <h3>${base.nome}</h3>
            <b>Tipo:</b> ${base.tipo}<br>
            <b>Status:</b> ${base.status}<br>
            <hr>
            <small>Adicionar ocorrência/comentário:</small>
            <textarea id="comentario-${base.nome.replace(/\s+/g, '')}" placeholder="Ex: Infiltração na sala 2..."></textarea>
            <button onclick="salvarComentario('${base.nome}')">Registrar</button>
        </div>
    `;
    
    marker.bindPopup(popupContent);
});

// =====================================================================
// NOVO: PARTE 5: FUNÇÃO DE CAPTURA DE COORDENADAS AO CLICAR NO MAPA
// =====================================================================
// Prepara uma janela de informação para mostrar o resultado do clique
const infoWindow = L.popup();

// Função que é executada quando você clica em qualquer lugar do mapa
function onClickMap(e) {
    // e.latlng contém as coordenadas exatas do clique
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Configura e abre o popup no local do clique
    infoWindow
        .setLatLng(e.latlng)
        .setContent(`
            <div style="text-align:center; padding: 5px;">
                <b>Nova Unidade?</b><br>
                Use estas coordenadas no seu cadastro:<br>
                <code style="background-color: #eee; padding: 2px 5px; font-size: 1.1em; display:inline-block; margin-top:5px;">
                    ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </span>
            </div>
        `)
        .openOn(map);

    // Também mostra no Console (F12) para facilitar a cópia
    console.log(`Coordenadas do clique: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
}

// Ativa o ouvinte de eventos: "map, quando alguém clicar, execute a função onClickMap"
map.on('click', onClickMap);

// =====================================================================
// PARTE 6: FUNÇÃO DE SALVAMENTO (Simulação)
// =====================================================================
window.salvarComentario = function(nomeBase) {
    const idTextarea = `comentario-${nomeBase.replace(/\s+/g, '')}`;
    const texto = document.getElementById(idTextarea).value;
    
    if(texto.trim() === "") {
        alert("Digite um comentário antes de salvar.");
        return;
    }
    
    alert(`Comentário para a ${nomeBase} salvo com sucesso:\n\n"${texto}"`);
    document.getElementById(idTextarea).value = "";
};

// =====================================================================
// PARTE 4: RENDERIZAÇÃO DOS PINS E CRIAÇÃO DO MENU DE FILTROS
// =====================================================================

// 4.1 Criação dos "Grupos de Camadas" (Layer Groups)
// Cada grupo representará um filtro no menu
const camadas = {
    "Subestações": L.layerGroup().addTo(map),
    "Bases Operacionais": L.layerGroup().addTo(map),
    "Sedes Administrativas": L.layerGroup().addTo(map),
    "Agências de Atendimento": L.layerGroup().addTo(map),
    "Almoxarifados": L.layerGroup().addTo(map)
};

// 4.2 Dicionário para direcionar cada tipo de base para a sua camada correta
const mapTypeToLayer = {
    "Subestação": camadas["Subestações"],
    "Base Operacional": camadas["Bases Operacionais"],
    "Sede Administrative": camadas["Sedes Administrativas"],
    "Agência de Atendimento": camadas["Agências de Atendimento"],
    "Almoxarifado": camadas["Almoxarifados"]
};

// 4.3 Loop para criar os pins e adicioná-los às camadas (e não direto no mapa)
basesFisicasEnergisa.forEach(base => {
    // Define o ícone correto
    const iconeCorreto = mapIconTypes[base.tipo] || iconSede;
    
    // Cria o marcador (Note que removemos o .addTo(map) daqui)
    const marker = L.marker([base.lat, base.lng], { icon: iconeCorreto });
    
    const popupContent = `
        <div class="popup-facilities">
            <h3>${base.nome}</h3>
            <b>Tipo:</b> ${base.tipo}<br>
            <b>Status:</b> ${base.status}<br>
            <hr>
            <small>Adicionar ocorrência/comentário:</small>
            <textarea id="comentario-${base.nome.replace(/\s+/g, '')}" placeholder="Ex: Infiltração na sala 2..."></textarea>
            <button onclick="salvarComentario('${base.nome}')">Registrar</button>
        </div>
    `;
    
    marker.bindPopup(popupContent);

    // Identifica qual é a camada desse marcador e o adiciona a ela
    const camadaDestino = mapTypeToLayer[base.tipo] || camadas["Sedes Administrativas"];
    marker.addTo(camadaDestino);
});

// 4.4 Cria o Menu (Painel de Controle) no canto superior direito do mapa
L.control.layers(
    null,       // Camadas base (mapa de fundo, vamos deixar null para não mexer)
    camadas,    // Nossos filtros com as caixinhas de marcação (Checkboxes)
    { 
        position: 'topright', // Posição na tela
        collapsed: false      // Mantém o menu sempre aberto para o gestor ver facilmente
    }
).addTo(map);