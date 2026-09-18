// =====================================================================
// INICIALIZAÇÃO DO FIREBASE
// =====================================================================
// =====================================================================
// INICIALIZAÇÃO DO FIREBASE (Apenas Texto)
// =====================================================================
// MANTENHA A SUA CONFIGURAÇÃO AQUI (Aquelas chaves que você copiou da tela)
const firebaseConfig = {
    apiKey: "AIzaSyAHocNZt0ihtkTplDjLYWMpOFoOj80ycBs",
    authDomain: "geo-facilities.firebaseapp.com",
    projectId: "geo-facilities",
    storageBucket: "geo-facilities.firebasestorage.app",
    messagingSenderId: "379130334399",
    appId: "1:379130334399:web:3ca7ef35480b7ddb6c8a0a"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); 
// APAGUE a linha: const storage = firebase.storage(); (não precisamos mais dela)

let dadosTerceirizados = [];

window.carregarDadosDaNuvem = async function() {
    try {
        const doc = await db.collection("facilities").doc("chamados").get();
        if (doc.exists) {
            dadosTerceirizados = doc.data().empresas;
        } else {
            dadosTerceirizados = [
                { id: 'lugar-eng', nome: 'Lugar Engenharia', telefone: '5579999999999', servicos: [] },
                { id: 'pr-const', nome: 'PR Construção', telefone: '5579888888888', servicos: [] }
            ];
        }
        window.renderizarTerceirizados();
    } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);
    }
};

carregarDadosDaNuvem();

window.salvarDadosGlobais = function() {
    db.collection("facilities").doc("chamados").set({
        empresas: dadosTerceirizados
    }).catch(error => console.error("Erro ao salvar no banco:", error));
};




// =====================================================================
// GEO-FACILITIES ENERGISA SERGIPE - CÓDIGO COMPLETO (COM IDs E CHAMADO)
// =====================================================================
// PARTE 1: INICIALIZAÇÃO DO MAPA E REFERÊNCIA GEOGRÁFICA
// =====================================================================

// Coordenadas da Sede (Aracaju/SE - Referência IBGE)
const COORD_SEDE = L.latLng(-10.95483, -37.05581);

// Inicializa o mapa centralizado na Sede com Zoom 12
const map = L.map('map').setView([COORD_SEDE.lat, COORD_SEDE.lng], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// =====================================================================
// PARTE 2: DEFINIÇÃO DOS ÍCONES CUSTOMIZADOS (SVG)
// =====================================================================

const iconSizeConfig = { iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [1, -34] };

const iconSede = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNWJiNSI+PHBhdGggZD0iTTE5IDZIOXY0SDVYMTNoMTBWMTBIMTlWNlpNMTEgOGgydjJIMTFWOlpNMTcgOGgydjJIMTdWOlpNMyAxMEgxdjhoMlYxMFpNMjMgMTBIMjF2OGgyVjEwWk0xOSAxNEg5djhIMTNWMTdoMnY1SDE5VjE0Wk0xMSA4SDl2OEgxMVY4Wk0xNyA4SDE1djhIMTdWOHoiLz48L3N2Zz4=',
    ...iconSizeConfig
});

const iconAlmoxarifado = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU1NTU1NSI+PHBhdGggZD0iTTE4LjYyNCAxNi4wOTRDMTku1MTU4LjU1MTk4MS44OTQyMjIuMDA5MTk5LjY1NzgyMS44MDkxOTkuNjU3MDk2LjcwOTE5NS43MDcyMDQuNTUxOTUxLjQwNzgwMS40ODU4MTkuMzQ0MTExLjMxNjgxOS4xMDY4MTguMzUxODE5Ljk0NjE5NS43MDcyMDQuNTUxOTUxLjQwNzgwMS40ODU4MTkuMzQ0MTExLjMxNjgxOS4xMDY4MTguMzUxODE5Ljk0NjE5NS43NDE5NTEuNTk3ODIwLjU5NzhDMTguNjI0IDE2LjA5NFoiLz48cGF0aCBkPSJNMjEgNmgydjEzLjVMMyAyMFY2aDJWNEg5VjZoNlY4SDIxdjJaTTUgOGgyVjZINVY4Wk0xMSA4aDJWNkgxMXY4Wk0xNyA4aDJWNkoxN3Y4WiIvPjwvc3ZnPg==',
    ...iconSizeConfig
});

const svgAgenciaAtendimento = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs><style>.outline { stroke: #004b6b; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; } .orange { fill: #ed7523; } .blue { fill: #009ebf; } .white { fill: #ffffff; } .no-stroke { stroke: none; }</style></defs>
  <rect x="20" y="55" width="125" height="135" class="outline white" />
  <path d="M 35 40 L 35 20 L 95 20 L 95 40 L 130 40 L 130 55 L 20 55 L 20 40 Z" class="outline orange" />
  <rect x="35" y="70" width="16" height="16" class="blue no-stroke" /><rect x="35" y="95" width="16" height="16" class="blue no-stroke" /><rect x="35" y="120" width="16" height="16" class="blue no-stroke" /><rect x="35" y="145" width="16" height="16" class="blue no-stroke" /><rect x="60" y="70" width="16" height="16" class="blue no-stroke" /><rect x="60" y="95" width="16" height="16" class="blue no-stroke" />
  <path d="M 120 40 H 175 A 10 10 0 0 1 185 50 V 80 A 10 10 0 0 1 175 90 H 145 L 130 105 V 90 H 120 A 10 10 0 0 1 110 80 V 50 A 10 10 0 0 1 120 40 Z" class="outline orange" />
  <circle cx="132" cy="65" r="4.5" class="white no-stroke" /><circle cx="147.5" cy="65" r="4.5" class="white no-stroke" /><circle cx="163" cy="65" r="4.5" class="white no-stroke" />
  <path d="M 70 155 C 70 125 80 115 100 115 C 120 115 130 125 130 155 Z" class="outline blue" />
  <polygon points="90 115, 110 115, 100 130" class="outline white" />
  <line x1="112" y1="135" x2="124" y2="135" class="outline" stroke-width="4"/>
  <path d="M 75 120 C 75 105 80 65 100 65 C 120 65 125 105 125 120 L 115 120 C 115 110 110 105 100 105 C 90 105 85 110 85 120 Z" class="outline orange" />
  <circle cx="100" cy="93" r="16" class="outline white" />
  <path d="M 84 91 C 90 80 96 83 100 85 C 104 83 110 80 116 91 C 115 71 85 71 84 91 Z" class="outline orange" />
  <circle cx="93" cy="90" r="2.5" class="outline" fill="#004b6b" stroke-width="0"/><circle cx="107" cy="90" r="2.5" class="outline" fill="#004b6b" stroke-width="0"/>
  <path d="M 94 99 Q 100 105 106 99" fill="none" class="outline" stroke-width="3.5"/>
  <rect x="65" y="165" width="115" height="25" class="outline orange" />
  <rect x="55" y="155" width="135" height="10" class="outline orange" />
  <line x1="10" y1="190" x2="190" y2="190" class="outline" fill="none"/>
</svg>`;

const svgSubestacao = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="100%" height="100%">
  <defs>
    <style>
      .blue-stroke { stroke: #009ebf; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .blue-fill { fill: #009ebf; }
      .green-stroke { stroke: #a5d13a; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .green-fill { fill: #a5d13a; }
      .orange-stroke { stroke: #ed7523; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .orange-fill { fill: #ed7523; }
      .white-fill { fill: #ffffff; }
      .white-stroke { stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; fill: none; }
    </style>
  </defs>
  <line x1="5" y1="185" x2="235" y2="185" class="blue-stroke" stroke-width="4" />
  <g class="blue-stroke" stroke-width="3">
    <path d="M 15 185 L 35 40 M 65 185 L 45 40 M 35 40 L 40 10 L 45 40" />
    <path d="M 20 150 L 60 150 M 25 115 L 55 115 M 30 80 L 50 80 M 33 55 L 47 55" />
    <path d="M 20 150 L 55 115 M 60 150 L 25 115 M 25 115 L 50 80 M 55 115 L 30 80 M 30 80 L 47 55 M 50 80 L 33 55" />
    <path d="M 175 185 L 195 40 M 225 185 L 205 40 M 195 40 L 200 10 L 205 40" />
    <path d="M 180 150 L 220 150 M 185 115 L 215 115 M 190 80 L 210 80 M 193 55 L 207 55" />
    <path d="M 180 150 L 215 115 M 220 150 L 185 115 M 185 115 L 210 80 M 215 115 L 190 80 M 190 80 L 207 55 M 210 80 L 193 55" />
  </g>
  <g class="blue-stroke" stroke-width="3">
    <path d="M 35 40 L 205 40" />
    <path d="M 42 55 L 198 55" />
    <path d="M 45 55 L 55 40 L 65 55 L 75 40 L 85 55 L 95 40 L 105 55 L 115 40 L 125 55 L 135 40 L 145 55 L 155 40 L 165 55 L 175 40 L 185 55 L 195 40 L 198 55" stroke-width="2.5" />
  </g>
  <rect x="52" y="115" width="38" height="18" class="green-fill" rx="2" />
  <rect x="49" y="113" width="5" height="22" class="blue-fill" rx="1.5" />
  <rect x="88" y="113" width="5" height="22" class="blue-fill" rx="1.5" />
  <rect x="63" y="137" width="16" height="48" class="blue-fill" />
  <rect x="69" y="133" width="4" height="4" class="green-fill" />
  <rect x="54" y="133" width="4" height="39" class="green-fill" />
  <rect x="54" y="172" width="9" height="4" class="green-fill" />
  <rect x="79" y="160" width="12" height="4" class="green-fill" />
  <rect x="79" y="172" width="12" height="4" class="green-fill" />
  <rect x="94" y="145" width="52" height="8" class="green-fill" rx="2" />
  <rect x="94" y="177" width="52" height="6" class="green-fill" rx="1" />
  <rect x="98" y="153" width="44" height="24" class="green-fill" />
  <path d="M 102 153 v 24 M 107 153 v 24 M 112 153 v 24 M 117 153 v 24 M 122 153 v 24 M 127 153 v 24 M 132 153 v 24 M 137 153 v 24" class="blue-stroke" stroke-width="2.5" />
  <rect x="91" y="153" width="7" height="24" class="green-fill" rx="1" />
  <rect x="142" y="153" width="7" height="24" class="green-fill" rx="1" />
  <rect x="154" y="123" width="67" height="62" class="orange-fill" />
  <rect x="150" y="115" width="75" height="8" class="blue-fill" />
  <rect x="159" y="133" width="57" height="17" class="white-fill" />
  <rect x="159" y="133" width="57" height="17" class="blue-stroke" stroke-width="2.5" />
  <line x1="187.5" y1="133" x2="187.5" y2="150" class="blue-stroke" stroke-width="2.5" />
  <rect x="190" y="160" width="24" height="25" class="white-fill" />
  <rect x="190" y="160" width="24" height="25" class="blue-stroke" stroke-width="2.5" />
  <line x1="202" y1="160" x2="202" y2="185" class="blue-stroke" stroke-width="2.5" />
  <path d="M 85 80 C 85 105, 90 120, 97 122" class="green-stroke" stroke-width="3.5" />
  <path d="M 120 80 L 120 125" class="green-stroke" stroke-width="3.5" />
  <path d="M 155 80 C 155 105, 150 120, 143 122" class="green-stroke" stroke-width="3.5" />
  <g class="blue-stroke">
    <path d="M 85 55 v 25 M 120 55 v 25 M 155 55 v 25" stroke-width="2.5" />
    <path d="M 81 65 h 8 M 80 72 h 10 M 81 79 h 8" stroke-width="4.5" />
    <path d="M 116 65 h 8 M 115 72 h 10 M 116 79 h 8" stroke-width="4.5" />
    <path d="M 151 65 h 8 M 150 72 h 10 M 151 79 h 8" stroke-width="4.5" />
  </g>
  <g class="orange-stroke">
    <line x1="120" y1="125" x2="120" y2="145" stroke-width="2.5" />
    <path d="M 115 130 h 10 M 114 136 h 12 M 115 142 h 10" stroke-width="4.5" />
    <g transform="translate(105, 145) rotate(-20) translate(-105, -145)">
      <line x1="105" y1="125" x2="105" y2="145" stroke-width="2.5" />
      <path d="M 100 130 h 10 M 99 136 h 12 M 100 142 h 10" stroke-width="4.5" />
    </g>
    <g transform="translate(135, 145) rotate(20) translate(-135, -145)">
      <line x1="135" y1="125" x2="135" y2="145" stroke-width="2.5" />
      <path d="M 130 130 h 10 M 129 136 h 12 M 130 142 h 10" stroke-width="4.5" />
    </g>
  </g>
  <g class="orange-stroke">
    <line x1="165" y1="95" x2="165" y2="115" stroke-width="2.5" />
    <path d="M 161 100 h 8 M 160 106 h 10 M 161 112 h 8" stroke-width="4.5" />
    <line x1="178" y1="95" x2="178" y2="115" stroke-width="2.5" />
    <path d="M 174 100 h 8 M 173 106 h 10 M 174 112 h 8" stroke-width="4.5" />
  </g>
</svg>`;

const svgBaseOperacional = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <style>
      .outline { stroke: #004b6b; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
      .outline-filled { stroke: #004b6b; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: #ffffff; }
      .orange { fill: #ed7523; }
      .blue { fill: #009ebf; }
      .white { fill: #ffffff; }
      .no-stroke { stroke: none; }
    </style>
    <clipPath id="truck-clip">
      <path d="M 65 180 V 150 H 95 V 140 H 125 L 140 155 H 165 C 172 155, 175 160, 175 170 V 180 H 160 A 12 12 0 0 0 136 180 H 95 A 12 12 0 0 0 71 180 Z" />
    </clipPath>
  </defs>
  <line x1="10" y1="190" x2="190" y2="190" class="outline" fill="none"/>
  <path d="M 20 190 V 90 L 55 70 V 90 L 90 70 V 90 L 125 70 V 190 Z" class="outline-filled" />
  <rect x="28" y="130" width="22" height="60" class="outline-filled" />
  <line x1="28" y1="140" x2="50" y2="140" class="outline" />
  <line x1="28" y1="150" x2="50" y2="150" class="outline" />
  <rect x="68" y="105" width="16" height="10" class="outline-filled" />
  <rect x="98" y="105" width="16" height="10" class="outline-filled" />
  <rect x="145" y="25" width="8" height="165" class="outline-filled" />
  <rect x="130" y="32" width="38" height="5" class="outline-filled" />
  <rect x="130" y="55" width="38" height="5" class="outline-filled" />
  <rect x="132" y="22" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="140" y="22" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="154" y="22" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="162" y="22" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="132" y="45" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="140" y="45" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="154" y="45" width="4" height="10" rx="2" class="outline-filled" />
  <rect x="162" y="45" width="4" height="10" rx="2" class="outline-filled" />
  <line x1="145" y1="80" x2="153" y2="80" class="outline" />
  <line x1="145" y1="92" x2="153" y2="92" class="outline" />
  <rect x="153" y="75" width="14" height="22" class="outline orange" />
  <rect x="157" y="69" width="6" height="6" class="outline-filled" />
  <path d="M 160 69 Q 160 59 156 55" class="outline" fill="none" />
  <line x1="75" y1="150" x2="75" y2="129" class="outline" />
  <line x1="90" y1="150" x2="90" y2="129" class="outline" />
  <rect x="62" y="117" width="120" height="4" class="outline orange" />
  <rect x="62" y="125" width="120" height="4" class="outline orange" />
  <path d="M 67 117 V 129 M 77 117 V 129 M 87 117 V 129 M 97 117 V 129 M 107 117 V 129 M 117 117 V 129 M 127 117 V 129 M 137 117 V 129 M 147 117 V 129 M 157 117 V 129 M 167 117 V 129 M 177 117 V 129" class="outline" fill="none" stroke-width="3" />
  <g>
    <path d="M 65 180 V 150 H 95 V 140 H 125 L 140 155 H 165 C 172 155, 175 160, 175 170 V 180 H 160 A 12 12 0 0 0 136 180 H 95 A 12 12 0 0 0 71 180 Z" class="white no-stroke" />
    <g clip-path="url(#truck-clip)">
      <path d="M 50 160 Q 75 160 85 190 H 50 Z" class="orange no-stroke" />
      <path d="M 70 190 Q 95 155 125 170 T 160 190 H 70 Z" class="blue no-stroke" />
      <path d="M 140 190 Q 155 170 185 170 V 190 Z" class="orange no-stroke" />
    </g>
    <path d="M 65 180 V 150 H 95 V 140 H 125 L 140 155 H 165 C 172 155, 175 160, 175 170 V 180 H 160 A 12 12 0 0 0 136 180 H 95 A 12 12 0 0 0 71 180 Z" class="outline" fill="none" />
    <path d="M 105 144 H 122 L 132 155 H 105 Z" class="outline-filled" />
    <line x1="105" y1="155" x2="105" y2="180" class="outline" />
    <line x1="110" y1="162" x2="115" y2="162" class="outline" />
    <path d="M 166 162 Q 170 162 172 166 H 166 Z" class="outline-filled" />
    <path d="M 124 172 L 127 164 L 130 172 Z" class="orange no-stroke" />
    <path d="M 124 172 Q 127 167 130 172 Z" class="blue no-stroke" />
    <rect x="132" y="168" width="12" height="3" class="no-stroke" fill="#004b6b" rx="1.5" />
    <circle cx="83" cy="180" r="10" class="outline-filled" />
    <circle cx="83" cy="180" r="4" class="outline" fill="#004b6b" />
    <circle cx="148" cy="180" r="10" class="outline-filled" />
    <circle cx="148" cy="180" r="4" class="outline" fill="#004b6b" />
  </g>
</svg>`;

const iconAgencia = L.divIcon({ html: svgAgenciaAtendimento, className: 'icone-transparente-svg', iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -45] });
const iconSubestacao = L.divIcon({ html: svgSubestacao, className: 'icone-transparente-svg', iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -45] });
const iconBaseOperacional = L.divIcon({ html: svgBaseOperacional, className: 'icone-transparente-svg', iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -45] });

const mapIconTypes = {
    "Subestação": iconSubestacao,
    "Base Operacional": iconBaseOperacional,
    "Sede Administrativa": iconSede,
    "Agência de Atendimento": iconAgencia,
    "Almoxarifado": iconAlmoxarifado
};

// =====================================================================
// PARTE 3: DADOS DE EXEMPLO (LOCAIS) — pins de demonstração
// =====================================================================

const unidades = [
    { nome: "Sede Administrativa (Aracaju)", tipo: "Sede Administrativa", lat: -10.95483, lng: -37.05581 },
    { nome: "Subestação Jardins", tipo: "Subestação", lat: -10.94500, lng: -37.06800 },
    { nome: "Base Operacional Centro", tipo: "Base Operacional", lat: -10.91000, lng: -37.05000 },
    { nome: "Agência de Atendimento Siqueira Campos", tipo: "Agência de Atendimento", lat: -10.92500, lng: -37.07200 },
    { nome: "Almoxarifado Central", tipo: "Almoxarifado", lat: -10.98000, lng: -37.04000 }
];

// =====================================================================
// PARTE 4: POPULAÇÃO DO MAPA COM CÁLCULO DE DISTÂNCIA
// =====================================================================

unidades.forEach(unidade => {
    const coordPonto = L.latLng(unidade.lat, unidade.lng);
    const distanciaMetros = COORD_SEDE.distanceTo(coordPonto);
    const distanciaKm = (distanciaMetros / 1000).toFixed(2);
    const iconeAplicado = mapIconTypes[unidade.tipo] || iconAgencia;

    const conteudoPopup = `
        <div style="font-family: sans-serif; font-size: 13px;">
            <h4 style="margin: 0 0 5px 0; color: #004b6b;">${unidade.nome}</h4>
            <b>Tipo:</b> ${unidade.tipo}<br>
            <hr style="border: 0; border-top: 1px solid #ccc; margin: 8px 0;">
            ${unidade.tipo === "Sede Administrativa"
                ? '📍 <strong>Ponto de Origem / Referência</strong>'
                : `📏 <strong>Distância da Sede:</strong> ${distanciaKm} km`
            }
        </div>
    `;

    L.marker(coordPonto, { icon: iconeAplicado })
     .addTo(map)
     .bindPopup(conteudoPopup);
});

// =====================================================================
// PARTE 3b: CARREGAMENTO DO MAPA DE MUNICÍPIOS
// =====================================================================
const municipiosNaoAtendidos = [
    "Arauá", "Boquim", "Cristinápolis", "Estância", "Indiaroba", "Itabaianinha", "Pedrinhas", "Riachão do Dantas", "Santa Luzia do Itanhy", "Tobias Barreto", "Tomar do Geru", "Umbaúba"
];

function normalizarNome(nome) { return nome ? nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : ""; }
const listaSulgipeFormatada = municipiosNaoAtendidos.map(normalizarNome);

fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-28-mun.json')
    .then(r => r.json())
    .then(data => {
        L.geoJSON(data, {
            style: feature => {
                const isSulgipe = listaSulgipeFormatada.includes(normalizarNome(feature.properties.name));
                return { fillColor: isSulgipe ? '#757474' : '#3c6846', color: isSulgipe ? '#555555' : '#1e7e34', weight: isSulgipe ? 1 : 1.5, fillOpacity: isSulgipe ? 0.5 : 0.3 };
            },
            onEachFeature: (feature, layer) => { if (feature.properties?.name) layer.bindTooltip(`MUNICÍPIO: ${feature.properties.name}`); }
        }).addTo(map);
    }).catch(e => console.error(e));

// =====================================================================
// PARTE 4b: DADOS (AGORA COM IDs PARA CADA LOCAL)
// =====================================================================
const dadosAgencias = [
    { "id": "ag-amparo", "agencia": "Energisa - Amparo do São Francisco", "endereco": "R. General Teixeira, Lote 9, Amparo", "latitude": -10.2185, "longitude": -36.8335 },
    { "id": "ag-aquidaba", "agencia": "Energisa - Aquidabã", "endereco": "Av. Parag, 2179 - Centro", "latitude": -10.2806, "longitude": -37.0189 },
    { "id": "ag-aracaju", "agencia": "Energisa - Aracaju", "endereco": "R. Carlos Correia, 398 - Siqueira Campos", "latitude": -10.9261, "longitude": -37.0678 },
    { "id": "ag-barradoscoqueiros", "agencia": "Energisa - Barra dos Coqueiros", "endereco": "Barra dos Coqueiros - SE", "latitude": -10.9091, "longitude": -37.0396 },
    { "id": "ag-caninde", "agencia": "Energisa - Canindé de São Francisco", "endereco": "Canindé de São Francisco - SE", "latitude": -9.6457, "longitude": -37.7892 },
    { "id": "ag-capela", "agencia": "Energisa - Capela", "endereco": "Capela - SE", "latitude": -10.5050, "longitude": -37.0520 },
    { "id": "ag-carmopolis", "agencia": "Energisa - Carmópolis", "endereco": "Carmópolis - SE", "latitude": -10.6480, "longitude": -36.9880 },
    { "id": "ag-itabaiana", "agencia": "Energisa - Itabaiana", "endereco": "Itabaiana - SE", "latitude": -10.6850, "longitude": -37.4250 },
    { "id": "ag-lagarto", "agencia": "Energisa - Lagarto", "endereco": "Lagarto - SE", "latitude": -10.9170, "longitude": -37.6650 },
    { "id": "ag-laranjeiras", "agencia": "Energisa - Laranjeiras", "endereco": "Laranjeiras - SE", "latitude": -10.8030, "longitude": -37.1720 },
    { "id": "ag-nossasenhoradagloria", "agencia": "Energisa - Nossa Senhora da Glória", "endereco": "Nossa Senhora da Glória - SE", "latitude": -10.2180, "longitude": -37.4200 },
    { "id": "ag-socorro", "agencia": "Energisa - Nossa Senhora do Socorro", "endereco": "Nossa Senhora do Socorro - SE", "latitude": -10.8540, "longitude": -37.1260 },
    { "id": "ag-propria", "agencia": "Energisa - Propriá", "endereco": "Propriá - SE", "latitude": -10.2100, "longitude": -36.8400 },
    { "id": "ag-saocristovao", "agencia": "Energisa - São Cristóvão", "endereco": "São Cristóvão - SE", "latitude": -11.0140, "longitude": -37.2060 },
    { "id": "ag-simaodias", "agencia": "Energisa - Simão Dias", "endereco": "Simão Dias - SE", "latitude": -10.7380, "longitude": -37.8100 }
];

const subestacoesEnergisa = [
    { "id": "sub-arj", "agencia": "Subestação - Aracaju (ARJ)", "endereco": "Av. Chanceler Osvaldo Aranha", "latitude": -10.9250, "longitude": -37.0760 },
    { "id": "sub-atl", "agencia": "Subestação - Atalaia (ATL)", "endereco": "Atalaia, Aracaju", "latitude": -10.9850, "longitude": -37.0490 },
    { "id": "sub-cbt", "agencia": "Subestação - Cabrita (CBT)", "endereco": "Zona Rural, São Cristóvão", "latitude": -10.9700, "longitude": -37.2100 },
    { "id": "sub-cme", "agencia": "Subestação - Coroa do Meio (CME)", "endereco": "Coroa do Meio, Aracaju", "latitude": -10.9630, "longitude": -37.0430 },
    { "id": "sub-din", "agencia": "Subestação - Distrito Industrial (DIN)", "endereco": "Distrito Industrial, Aracaju", "latitude": -10.9300, "longitude": -37.0850 },
    { "id": "sub-edg", "agencia": "Subestação - Eduardo Gomes (EDG)", "endereco": "Eduardo Gomes", "latitude": -10.9000, "longitude": -37.1000 },
    { "id": "sub-itb", "agencia": "Subestação - Itabaiana (ITB)", "endereco": "Itabaiana - SE", "latitude": -10.6800, "longitude": -37.4200 },
    { "id": "sub-lag", "agencia": "Subestação - Lagarto (LAG)", "endereco": "Lagarto - SE", "latitude": -10.9100, "longitude": -37.6600 }
];

const basesFisicasEnergisa = dadosAgencias.map(item => ({ id: item.id, nome: item.agencia, endereco: item.endereco, lat: item.latitude, lng: item.longitude, tipo: "Agência de Atendimento" }));
const basesSubestacoes = subestacoesEnergisa.map(item => ({ id: item.id, nome: item.agencia, endereco: item.endereco, lat: item.latitude, lng: item.longitude, tipo: "Subestação" }));
const todasBasesFisicas = [...basesFisicasEnergisa, ...basesSubestacoes];

// =====================================================================
// PARTE 5: RENDERIZAÇÃO DOS PINS E FORMULÁRIO DO POPUP
// =====================================================================

window.marcadoresGlobais = {};

// Verifica se a base ainda tem algum serviço "em andamento" e ativa/desativa
// a animação de piscar no ícone do mapa.
window.verificarEAtualizarMarcador = function(baseId, nomeBase) {
    const marcador = window.marcadoresGlobais[baseId];
    if (!marcador || !marcador._icon) return;

    let temAndamento = false;
    let temAguardando = false;

    dadosTerceirizados.forEach(empresa => {
        if (empresa.servicos) {
            empresa.servicos.forEach(servico => {
                if (servico.local === nomeBase) {
                    if (servico.statusAtual === 'andamento') {
                        temAndamento = true;
                    } else if (servico.statusAtual === 'aguardando') {
                        temAguardando = true;
                    }
                }
            });
        }
    });

    // Reseta as classes de animação do ícone (mantendo a limpeza caso a classe ainda exista)
    marcador._icon.classList.remove('icone-em-andamento', 'icone-atrasado', 'icone-aguardando');

    // Aplica a classe com base na prioridade (Andamento se sobrepõe a Aguardando)
    if (temAndamento) {
        marcador._icon.classList.add('icone-em-andamento');
    } else if (temAguardando) {
        marcador._icon.classList.add('icone-aguardando');
    }
};

const camadas = {
    "Subestações": L.layerGroup().addTo(map), "Bases Operacionais": L.layerGroup().addTo(map),
    "Sedes Administrativas": L.layerGroup().addTo(map), "Agências de Atendimento": L.layerGroup().addTo(map),
};
const mapTypeToLayer = { "Subestação": camadas["Subestações"], "Base Operacional": camadas["Bases Operacionais"], "Sede Administrative": camadas["Sedes Administrativas"], "Agência de Atendimento": camadas["Agências de Atendimento"], "Almoxarifado": camadas["Almoxarifados"] };

function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Calcula a distância real percorrida por estrada (OSRM), que reflete a
// "vida real" muito melhor do que a linha reta. Se a API de rotas falhar
// (sem internet, fora do ar, etc.), cai de volta na linha reta (Haversine).
async function calcularDistanciaRodoviaria(origem, destino) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origem.lng},${origem.lat};${destino.lng},${destino.lat}?overview=false`;
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        if (dados.code === 'Ok' && dados.routes && dados.routes[0]) {
            return dados.routes[0].distance / 1000; // metros -> km
        }
    } catch (erro) {
        console.warn(`Não foi possível calcular a rota real até ${destino.lat},${destino.lng}. Usando distância em linha reta como alternativa.`, erro);
    }
    return calcularDistanciaHaversine(origem.lat, origem.lng, destino.lat, destino.lng);
}

async function criarMarcadoresComDistanciaReal() {
    // Busca todas as distâncias por estrada em paralelo antes de desenhar os pins,
    // para não deixar o mapa "aparecendo aos poucos" nem travar em requisições sequenciais.
    const distancias = await Promise.all(
        todasBasesFisicas.map(base =>
            calcularDistanciaRodoviaria(COORD_SEDE, { lat: base.lat, lng: base.lng })
        )
    );

    todasBasesFisicas.forEach((base, indice) => {
        const iconeCorreto = mapIconTypes[base.tipo] || new L.Icon.Default();
        const distanciaKm = distancias[indice].toFixed(1);
        const marker = L.marker([base.lat, base.lng], { icon: iconeCorreto });

        // Toda vez que o marcador é adicionado ao mapa (inclusive ao trocar de camada/zoom),
        // reavalia se ele deve ou não piscar.
        marker.on('add', () => window.verificarEAtualizarMarcador(base.id, base.nome));

        window.marcadoresGlobais[base.id] = marker;

        let optionsEmpresas = dadosTerceirizados.map(emp => `<option value="${emp.id}">${emp.nome}</option>`).join('');

        const popupContent = `
            <div class="modern-popup">
                <span class="tag">${base.tipo}</span>
                <h3>${base.nome}</h3>
                <div class="info-row"><strong>Distância:</strong> <span>${distanciaKm} km da sede (por rodovia)</span></div>
                <div class="info-row"><strong>Endereço:</strong> <span>${base.endereco}</span></div>
                <hr>
                <label>Vincular Serviço / Ocorrência</label>
                
                <select id="empresa-${base.id}" class="popup-select">
                    <option value="" disabled selected>Selecione a Empresa Parceira</option>
                    ${optionsEmpresas}
                </select>

                <!-- NOVO: TIPO DE SERVIÇO -->
                <select id="tipo-servico-${base.id}" class="popup-select" style="margin-bottom: 10px;" onchange="atualizarChecklist('${base.id}')">
                    <option value="" disabled selected>Tipo de Serviço...</option>
                    <option value="civil">Reforma Civil / Predial</option>
                    <option value="climatizacao">Ar-Condicionado / PMOC</option>
                    <option value="eletrica">Manutenção Elétrica / Subestação</option>
                </select>

                <!-- NOVO: CAIXA DO CHECKLIST (Oculta por padrão) -->
                <div id="checklist-container-${base.id}" style="display:none; margin-bottom: 10px; font-size: 0.85em; background: #f1f5f9; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; color: #334155;"></div>
                
                <select id="status-${base.id}" class="popup-select">
                    <option value="andamento">Em Andamento</option>
                    <option value="aguardando">Aguardando Peça/Aprovação</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                
                <input type="text" id="chamado-${base.id}" class="popup-select" style="margin-bottom: 10px;" placeholder="Nº do Chamado (Obrigatório)">
                <input type="date" id="data-${base.id}" class="popup-select" style="margin-bottom: 10px; cursor: pointer;">
                <textarea id="desc-${base.id}" placeholder="Descrição do serviço (Ex: Pintura da fachada...)"></textarea>
                <label style="font-size: 0.8em; color: #555; display: block; margin-top: 5px; margin-bottom: 2px;">
            <b>Anexar Evidência (Foto):</b>
        </label>
        <input type="file" id="evidencia-${base.id}" accept="image/*" style="width: 100%; font-size: 0.8em; margin-bottom: 12px;">
        <!-- ========================================================= -->

        <!-- Botão de Salvar -->
        <button onclick="registrarServico('${base.id}', '${base.nome}')" 
                class="btn-link" 
                style="background-color: #f26522; color: white; border: none; width: 100%; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">
            Registrar Serviço
        </button>
    </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapTypeToLayer[base.tipo] || camadas["Agências de Atendimento"]);
    });

    L.control.layers(null, camadas, { position: 'topright', collapsed: false }).addTo(map);
}

criarMarcadoresComDistanciaReal();

// =====================================================================
// PARTE 6: LÓGICA DE REGISTRO E ABA LATERAL
// =====================================================================
function formatarDataBR(dataString) {
    if (!dataString) return '--/--/----';
    const partes = dataString.split('-');
    if(partes.length !== 3) return dataString;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

window.atualizarChecklist = function(baseId) {
    const tipo = document.getElementById(`tipo-servico-${baseId}`).value;
    const container = document.getElementById(`checklist-container-${baseId}`);
    let html = '';

    if (tipo === 'civil') {
        html = `
            <strong style="display:block; margin-bottom:8px; color:#004b6b;">Checklist de Segurança (Obrigatório):</strong>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Isolamento da área realizado</label>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> EPIs completos utilizados</label>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Entulho recolhido/descartado corretamente</label>
        `;
    } else if (tipo === 'climatizacao') {
        html = `
            <strong style="display:block; margin-bottom:8px; color:#004b6b;">Checklist Operacional (Obrigatório):</strong>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Limpeza de filtros realizada</label>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Verificação de gás refrigerante (Pressão OK)</label>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Teste de dreno desobstruído concluído</label>
        `;
    } else if (tipo === 'eletrica') {
        html = `
            <strong style="display:block; margin-bottom:8px; color:#004b6b;">Regras de Ouro (Obrigatório):</strong>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Desenergização / Seccionamento confirmado</label>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Travamento e bloqueio aplicados (LOTO)</label>
            <label style="display:flex; gap:8px; margin-bottom:4px;"><input type="checkbox" class="chk-${baseId}"> Teste de ausência de tensão realizado</label>
        `;
    }

    if (html) {
        container.innerHTML = html;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
};
// =====================================================================
// UPLOAD NO CLOUDINARY E SALVAR NO FIREBASE
// =====================================================================

// Função separada para enviar a foto para o Cloudinary
// Função separada para enviar a foto para o ImgBB
async function enviarFotoImgBB(file) {
    const API_KEY = "3f159529a71f1e4c44c57132ad219a99"; // Cole a chave gerada no site do ImgBB
    const url = `https://api.imgbb.com/1/upload?key=${API_KEY}`;
    
    const formData = new FormData();
    formData.append("image", file); // O ImgBB exige que o campo se chame "image"

    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (data.success) {
        return data.data.url; // Retorna o link público e seguro da foto pronta
    } else {
        throw new Error("Erro ao fazer upload da imagem no ImgBB");
    }
}

window.registrarServico = async function(baseId, nomeBase) {
    const empresaId = document.getElementById(`empresa-${baseId}`).value;
    const statusServico = document.getElementById(`status-${baseId}`).value;
    const numeroChamado = document.getElementById(`chamado-${baseId}`).value;
    const dataServico = document.getElementById(`data-${baseId}`).value;
    const descricao = document.getElementById(`desc-${baseId}`).value;
    const inputArquivo = document.getElementById(`evidencia-${baseId}`);
    const arquivo = (inputArquivo && inputArquivo.files) ? inputArquivo.files[0] : null;

    if (!empresaId || !numeroChamado.trim() || !dataServico || !descricao.trim()) {
        return alert("Por favor, preencha todos os campos obrigatórios.");
    }

    const btn = event.target;
    const textoOriginal = btn.innerText;
    btn.innerText = "Enviando foto e salvando...";
    btn.disabled = true;

    let urlFoto = null;

    // Se houver arquivo, envia para o Cloudinary primeiro
    if (arquivo) {
        try {
            urlFoto = await enviarFotoImgBB(arquivo);
        } catch (e) {
            console.error(e);
            alert("Erro ao enviar a foto. Verifique a chave de API.");
            btn.innerText = textoOriginal;
            btn.disabled = false;
            return;
        }
    }

    // Salva tudo no Firebase (Texto + Link do Cloudinary)
    const empresa = dadosTerceirizados.find(e => e.id === empresaId);
    if(empresa) {
        empresa.servicos.push({
            id: 'sv-' + Date.now(),
            chamado: numeroChamado,
            statusAtual: statusServico,
            localId: baseId,
            local: nomeBase,
            desc: descricao,
            foto: urlFoto, // Salva o link do Cloudinary!
            historico: [ { status: statusServico, data: dataServico } ]
        });

        window.salvarDadosGlobais(); // Manda o JSON para o Firestore
        window.verificarEAtualizarMarcador(baseId, nomeBase);
        alert(`Serviço #${numeroChamado} registrado com sucesso!`);
        window.renderizarTerceirizados();
    }
    
    btn.innerText = textoOriginal;
    btn.disabled = false;
};

    const empresa = dadosTerceirizados.find(e => e.id === empresaId);

    if(empresa) {
        empresa.servicos.push({
            id: 'sv-' + Date.now(),
            chamado: numeroChamado,
            statusAtual: statusServico,
            localId: baseId,
            local: nomeBase,
            desc: descricao,
            historico: [ { status: statusServico, data: dataServico } ]
        });

        window.verificarEAtualizarMarcador(baseId, nomeBase);

        document.getElementById(`empresa-${baseId}`).value = "";
        document.getElementById(`status-${baseId}`).value = "andamento";
        document.getElementById(`chamado-${baseId}`).value = "";
        document.getElementById(`data-${baseId}`).value = "";
        document.getElementById(`desc-${baseId}`).value = "";

        alert(`Serviço (Chamado: ${numeroChamado}) registrado com sucesso para a empresa ${empresa.nome}!`);

        window.renderizarTerceirizados();
        document.getElementById('lista-terceirizados').classList.add('mostrar');
        document.getElementById('btn-terceirizados').classList.add('ativo');
        setTimeout(() => window.toggleTerceirizado(empresaId), 100);
    }
    window.deletarServico = function(empresaId, servicoId) {
        if (!confirm("Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita.")) {
            return;
        }
    
        const empresa = dadosTerceirizados.find(e => e.id === empresaId);
        if (empresa) {
            // Encontra o serviço antes de remover para saber qual marcador atualizar
            const servico = empresa.servicos.find(s => s.id === servicoId);
            const baseId = servico ? servico.localId : null;
            const nomeBase = servico ? servico.local : null;
    
            // Filtra removendo o serviço selecionado
            empresa.servicos = empresa.servicos.filter(s => s.id !== servicoId);
    
            // Atualiza o banco e a interface
            window.salvarDadosGlobais();
            if (baseId && nomeBase) {
                window.verificarEAtualizarMarcador(baseId, nomeBase);
            }
    
            alert("Chamado excluído com sucesso!");
            window.renderizarTerceirizados();
        }
    };

window.mudarStatusServico = function(empresaId, servicoId) {
    const novoStatus = document.getElementById(`select-status-${servicoId}`).value;
    const novaData = document.getElementById(`input-data-${servicoId}`).value;

    if (!novaData) return alert("Por favor, selecione a data dessa etapa.");

    const empresa = dadosTerceirizados.find(e => e.id === empresaId);
    if(empresa) {
        const servico = empresa.servicos.find(s => s.id === servicoId);
        if(servico) {
            servico.statusAtual = novoStatus;
            servico.historico.push({ status: novoStatus, data: novaData });

            // Atualiza o pin no mapa para parar (ou não) de piscar.
            // Alguns serviços antigos (mock) não têm "localId" salvo, então
            // buscamos o ID da base pelo nome do local como alternativa.
            let baseIdParaAtualizar = servico.localId;
            if (!baseIdParaAtualizar) {
                const baseEncontrada = todasBasesFisicas.find(b => b.nome === servico.local);
                if (baseEncontrada) baseIdParaAtualizar = baseEncontrada.id;
            }
            window.verificarEAtualizarMarcador(baseIdParaAtualizar, servico.local);

            alert("Status atualizado e registrado no histórico!");
            window.renderizarTerceirizados();
        }
    }
};

window.focarNoMapa = function(localId) {
    const marker = window.marcadoresGlobais[localId];
    if (marker) {
        map.flyTo(marker.getLatLng(), 16, { duration: 1.5 });
        setTimeout(() => marker.openPopup(), 1500);
    } else {
        console.warn("Local não encontrado pelo ID. Verifique o ID do serviço.");
    }
};

window.toggleTerceirizado = function(id) {
    const body = document.getElementById(`body-${id}`);
    const header = document.getElementById(`header-${id}`);
    if (body.classList.contains('mostrar')) {
        body.classList.remove('mostrar');
        header.classList.remove('aberto');
    } else {
        document.querySelectorAll('.terceirizado-body').forEach(el => el.classList.remove('mostrar'));
        document.querySelectorAll('.terceirizado-header').forEach(el => el.classList.remove('aberto'));
        body.classList.add('mostrar');
        header.classList.add('aberto');
    }
};

window.renderizarTerceirizados = function() {
    
    const listaTerceirizados = document.getElementById('lista-terceirizados');
    if(!listaTerceirizados) return;

    let htmlCards = '';
    dadosTerceirizados.forEach(empresa => {
        let htmlServicos = empresa.servicos.map(s => {
            const labelStatusAtual = s.statusAtual === 'andamento' ? 'Em Andamento' : 'Realizado';

            const htmlHistorico = s.historico.map(h => {
                const badgeTxt = h.status === 'andamento' ? 'Iniciado:' : 'Concluído:';
                return `<div style="font-size: 0.75em; color: #666; margin-top: 3px;">
                            <strong>${badgeTxt}</strong> ${formatarDataBR(h.data)}
                        </div>`;
            }).join('');

            // ---  FOTO NA LATERAL ---
            const htmlFoto = s.foto ? `
                <div style="margin: 8px 0; text-align: center;">
                    <a href="${s.foto}" target="_blank" title="Clique para abrir imagem completa">
                        <img src="${s.foto}" alt="Evidência do chamado" 
                             style="width: 100%; max-height: 120px; border-radius: 6px; border: 1px solid #ccc; object-fit: cover;">
                    </a>
                </div>
            ` : '';

            let htmlMudarStatus = '';
            if (s.statusAtual === 'andamento') {
                htmlMudarStatus = `
                    <div class="mudar-status-box" onclick="event.stopPropagation()" style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #ddd;">
                        <label style="font-size: 0.75em; font-weight: bold; color: #444; display: block; margin-bottom: 6px;">Registrar Conclusão:</label>
                        <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                            <select id="select-status-${s.id}" style="padding: 4px; font-size: 0.8em; flex: 1; border: 1px solid #ccc; border-radius: 4px; outline: none;">
                                <option value="realizado">Realizado</option>
                            </select>
                            <input type="date" id="input-data-${s.id}" style="padding: 4px; font-size: 0.8em; flex: 1; border: 1px solid #ccc; border-radius: 4px; outline: none;">
                        </div>
                        <button onclick="mudarStatusServico('${empresa.id}', '${s.id}')" style="width: 100%; font-size: 0.8em; padding: 6px; cursor: pointer; background: #ed7523; color: white; border: none; border-radius: 4px; font-weight: bold;">Salvar</button>
                    </div>
                `;
            }

            const paramFocoMapa = s.localId ? `'${s.localId}'` : `Object.keys(window.marcadoresGlobais).find(k => window.marcadoresGlobais[k].getPopup().getContent().includes('${s.local}'))`;

            return `
                <div class="servico-item ${s.statusAtual}" onclick="focarNoMapa(${paramFocoMapa})">
                    <div class="servico-local">${s.local}</div>
                    <div style="font-size: 0.75em; font-weight: bold; color: #004b6b; margin-top: 4px;">Chamado: #${s.chamado}</div>
                    <div style="margin-bottom: 8px;">${htmlHistorico}</div>
                    <div class="servico-desc">${s.desc}</div>
                    
                    <!-- INSERÇÃO DA FOTO AQUI -->
                    ${htmlFoto}

                    <span class="badge-status ${s.statusAtual}">${labelStatusAtual}</span>
                    ${htmlMudarStatus}
                </div>
            `;
        }).join('');

        if(empresa.servicos.length === 0) htmlServicos = `<div class="servico-desc" style="text-align:center;">Nenhum serviço registrado.</div>`;

        htmlCards += `
            <div class="terceirizado-card">
                <div class="terceirizado-header" id="header-${empresa.id}" onclick="toggleTerceirizado('${empresa.id}')">
                    <div class="empresa-info"><span>${empresa.nome}</span></div>
                    <a href="https://wa.me/${empresa.telefone}" target="_blank" class="btn-whatsapp" onclick="event.stopPropagation()">WhatsApp</a>
                </div>
                <div class="terceirizado-body" id="body-${empresa.id}">
                    ${htmlServicos}
                </div>
            </div>
        `;
    });
    listaTerceirizados.innerHTML = htmlCards;
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-terceirizados');
    const lista = document.getElementById('lista-terceirizados');

    if (btn && lista) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            lista.classList.toggle('mostrar');
            btn.classList.toggle('ativo');
        });
        window.renderizarTerceirizados();
    }
});

// =====================================================================
// LÓGICA DE FILTROS NO MAPA
// =====================================================================
window.aplicarFiltros = function() {
    const filtroStatus = document.getElementById('filtro-status').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;

    todasBasesFisicas.forEach(base => {
        const marker = window.marcadoresGlobais[base.id];
        if (!marker) return;

        // 1. Verifica filtro de Tipo
        let mostrarPorTipo = (filtroTipo === 'todos' || base.tipo === filtroTipo);
        
        // 2. Verifica filtro de Status
        let mostrarPorStatus = true;
        if (filtroStatus !== 'todos') {
            let statusBase = 'nenhum';
            let temAndamento = false, temAguardando = false;

            dadosTerceirizados.forEach(empresa => {
                if (empresa.servicos) {
                    empresa.servicos.forEach(servico => {
                        if (servico.local === base.nome) {
                            if (servico.statusAtual === 'andamento') {
                                temAndamento = true;
                            } else if (servico.statusAtual === 'aguardando') {
                                temAguardando = true;
                            }
                        }
                    });
                }
            });

            if (temAndamento) statusBase = 'andamento';
            else if (temAguardando) statusBase = 'aguardando';

            mostrarPorStatus = (filtroStatus === statusBase);
        }

        // 3. Aplica o filtro
        const camadaCorreta = mapTypeToLayer[base.tipo] || camadas["Agências de Atendimento"];

        if (mostrarPorTipo && mostrarPorStatus) {
            if (!camadaCorreta.hasLayer(marker)) {
                camadaCorreta.addLayer(marker);
            }
        } else {
            if (camadaCorreta.hasLayer(marker)) {
                camadaCorreta.removeLayer(marker);
            }
        }
    });
};