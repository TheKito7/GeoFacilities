// =====================================================================
// GEO FACILITIES 3.0 - APP PRINCIPAL
// =====================================================================

console.log("### GeoFacilities app.js 3.0 carregado ###");


// =====================================================================
// 1. FIREBASE
// =====================================================================

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

let dadosTerceirizados = [];

window.salvarDadosGlobais = async function () {
    try {
        await db.collection("facilities").doc("chamados").set({
            empresas: dadosTerceirizados
        });

        return true;
    } catch (error) {
        console.error("Erro ao salvar dados no Firestore:", error);
        throw error;
    }
};

window.carregarDadosDaNuvem = async function () {
    try {
        const doc = await db.collection("facilities").doc("chamados").get();

        if (doc.exists && Array.isArray(doc.data()?.empresas)) {
            dadosTerceirizados = doc.data().empresas;
        } else {
            dadosTerceirizados = [
                {
                    id: "lugar-eng",
                    nome: "Lugar Engenharia",
                    telefone: "5579999999999",
                    servicos: []
                },
                {
                    id: "pr-const",
                    nome: "PR Construção",
                    telefone: "5579888888888",
                    servicos: []
                }
            ];

            await window.salvarDadosGlobais();
        }

        dadosTerceirizados.forEach(empresa => {
            if (!Array.isArray(empresa.servicos)) {
                empresa.servicos = [];
            }
        });

        window.renderizarTerceirizados?.();
    } catch (error) {
        console.error("Erro ao carregar dados do Firebase:", error);

        if (!dadosTerceirizados.length) {
            dadosTerceirizados = [
                {
                    id: "lugar-eng",
                    nome: "Lugar Engenharia",
                    telefone: "5579999999999",
                    servicos: []
                },
                {
                    id: "pr-const",
                    nome: "PR Construção",
                    telefone: "5579888888888",
                    servicos: []
                }
            ];
        }
    }
};
// =====================================================================
// ATUALIZAR SELECTS DE EMPRESAS NOS POPUPS
// =====================================================================

window.atualizarSelectsEmpresas = function () {

    const optionsEmpresas =
        dadosTerceirizados
            .map(
                empresa => `
                    <option value="${escapeHtml(empresa.id)}">
                        ${escapeHtml(empresa.nome)}
                    </option>
                `
            )
            .join("");

    todasBasesFisicas.forEach(
        base => {

            const select =
                document.getElementById(
                    `empresa-${base.id}`
                );

            if (!select) {
                return;
            }

            const valorAtual =
                select.value;

            select.innerHTML = `
                <option
                    value=""
                    disabled
                >
                    Selecione a Empresa Parceira
                </option>

                ${optionsEmpresas}
            `;

            // Mantém o valor selecionado, se ainda existir
            if (
                dadosTerceirizados.some(
                    empresa =>
                        empresa.id ===
                        valorAtual
                )
            ) {
                select.value =
                    valorAtual;
            } else {
                select.value =
                    "";
            }
        }
    );
};
// =====================================================================
// 2. MAPA
// =====================================================================

const COORD_SEDE = L.latLng(-10.95483, -37.05581);

const map = L.map("map").setView(
    [COORD_SEDE.lat, COORD_SEDE.lng],
    12
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
).addTo(map);

// =====================================================================
// 3. ÍCONES
// =====================================================================

const iconSizeConfig = {
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [1, -34]
};

const iconSede = L.icon({
    iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwNWJiNSI+PHBhdGggZD0iTTE5IDZIOXY0SDVYMTNoMTBWMTBIMTlWNlpNMTEgOGgydjJIMTFWOlpNMTcgOGgydjJIMTdWOlpNMyAxMEgxdjhoMlYxMFpNMjMgMTBIMjF2OGgyVjEwWk0xOSAxNEg5djhIMTNWMTdoMnY1SDE5VjE0Wk0xMSA4SDl2OEgxMVY4Wk0xNyA4SDE1djhIMTdWOHoiLz48L3N2Zz4=",
    ...iconSizeConfig
});

const iconAlmoxarifado = L.icon({
    iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzU1NTU1NSI+PHBhdGggZD0iTTE4LjYyNCAxNi4wOTRDMTku1NTU4LjU1MTk4MS44OTQyMjIuMDA5MTk5LjY1NzgyMS44MDkxOTkuNjU3MDk2LjcwOTE5NS43MDcyMDQuNTUxOTUxLjQwNzgwMS40ODU4MTkuMzQ0MTExLjMxNjgxOS4xMDY4MTguMzUxODE5Ljk0NjE5NS43MDcyMDQuNTUxOTUxLjQwNzgwMS40ODU4MTkuMzQ0MTExLjMxNjgxOS4xMDY4MTguMzUxODE5Ljk0NjE5NS43NDE5NTEuNTk3ODIwLjU5NzhDMTguNjI0IDE2LjA5NFoiLz48cGF0aCBkPSJNMjEgNmgydjEzLjVMMyAyMFY2aDJWNEg5VjZoNlY4SDIxdjJaTTUgOGgyVjZINVY4Wk0xMSA4aDJWNkgxMXY4Wk0xNyA4aDJWNkoxN3Y4WiIvPjwvc3ZnPg==",
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

  <circle cx="93" cy="90" r="2.5" fill="#004b6b"/>
  <circle cx="107" cy="90" r="2.5" fill="#004b6b"/>
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

    <g transform="translate(105,145) rotate(-20) translate(-105,-145)">
      <line x1="105" y1="125" x2="105" y2="145" stroke-width="2.5" />
      <path d="M 100 130 h 10 M 99 136 h 12 M 100 142 h 10" stroke-width="4.5" />
    </g>

    <g transform="translate(135,145) rotate(20) translate(-135,-145)">
      <line x1="135" y1="125" x2="135" y2="145" stroke-width="2.5" />
      <path d="M 130 130 h 10 M 129 136 h 12 M 130 142 h 10" stroke-width="4.5" />
    </g>

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
    <circle cx="83" cy="180" r="4" fill="#004b6b" />

    <circle cx="148" cy="180" r="10" class="outline-filled" />
    <circle cx="148" cy="180" r="4" fill="#004b6b" />
  </g>
</svg>`;

const iconAgencia = L.divIcon({
    html: svgAgenciaAtendimento,
    className: "icone-transparente-svg",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -45]
});

const iconSubestacao = L.divIcon({
    html: svgSubestacao,
    className: "icone-transparente-svg",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -45]
});

const iconBaseOperacional = L.divIcon({
    html: svgBaseOperacional,
    className: "icone-transparente-svg",
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -45]
});

const mapIconTypes = {
    "Subestação": iconSubestacao,
    "Base Operacional": iconBaseOperacional,
    "Sede Administrativa": iconSede,
    "Agência de Atendimento": iconAgencia,
    "Almoxarifado": iconAlmoxarifado
};

// =====================================================================
// 4. PONTOS DE DEMONSTRAÇÃO EXISTENTES
// =====================================================================

const unidades = [
    {
        nome: "Sede Administrativa (Aracaju)",
        tipo: "Sede Administrativa",
        lat: -10.95483,
        lng: -37.05581
    },
    {
        nome: "Subestação Jardins",
        tipo: "Subestação",
        lat: -10.945,
        lng: -37.068
    },
    {
        nome: "Base Operacional Centro",
        tipo: "Base Operacional",
        lat: -10.91,
        lng: -37.05
    },
    {
        nome: "Agência de Atendimento Siqueira Campos",
        tipo: "Agência de Atendimento",
        lat: -10.925,
        lng: -37.072
    },
    {
        nome: "Almoxarifado Central",
        tipo: "Almoxarifado",
        lat: -10.98,
        lng: -37.04
    }
];

unidades.forEach(unidade => {
    const coordPonto = L.latLng(
        unidade.lat,
        unidade.lng
    );

    const distanciaMetros =
        COORD_SEDE.distanceTo(
            coordPonto
        );

    const distanciaKm =
        (
            distanciaMetros /
            1000
        ).toFixed(2);

    const iconeAplicado =
        mapIconTypes[
            unidade.tipo
        ] ||
        iconAgencia;

    const conteudoPopup = `
        <div
            style="
                font-family:sans-serif;
                font-size:13px;
            "
        >
            <h4
                style="
                    margin:0 0 5px;
                    color:#004b6b;
                "
            >
                ${unidade.nome}
            </h4>

            <b>Tipo:</b>
            ${unidade.tipo}
            <br>

            <hr
                style="
                    border:0;
                    border-top:1px solid #ccc;
                    margin:8px 0;
                "
            >

            ${
                unidade.tipo ===
                "Sede Administrativa"
                    ? `
                        📍
                        <strong>
                            Ponto de Origem / Referência
                        </strong>
                    `
                    : `
                        📏
                        <strong>
                            Distância da Sede:
                        </strong>
                        ${distanciaKm} km
                    `
            }
        </div>
    `;

    L.marker(
        coordPonto,
        {
            icon: iconeAplicado
        }
    )
        .addTo(map)
        .bindPopup(
            conteudoPopup
        );
});

// =====================================================================
// 5. MUNICÍPIOS
// =====================================================================

const municipiosNaoAtendidos = [
    "Arauá",
    "Boquim",
    "Cristinápolis",
    "Estância",
    "Indiaroba",
    "Itabaianinha",
    "Pedrinhas",
    "Riachão do Dantas",
    "Santa Luzia do Itanhy",
    "Tobias Barreto",
    "Tomar do Geru",
    "Umbaúba"
];

function normalizarNome(nome) {
    return nome
        ? nome
              .normalize(
                  "NFD"
              )
              .replace(
                  /[\u0300-\u036f]/g,
                  ""
              )
              .toLowerCase()
              .trim()
        : "";
}

const listaSulgipeFormatada =
    municipiosNaoAtendidos.map(
        normalizarNome
    );

fetch(
    "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-28-mun.json"
)
    .then(
        resposta =>
            resposta.json()
    )
    .then(
        data => {
            L.geoJSON(
                data,
                {
                    style:
                        feature => {
                            const isSulgipe =
                                listaSulgipeFormatada.includes(
                                    normalizarNome(
                                        feature.properties.name
                                    )
                                );

                            return {
                                fillColor:
                                    isSulgipe
                                        ? "#757474"
                                        : "#3c6846",

                                color:
                                    isSulgipe
                                        ? "#555555"
                                        : "#1e7e34",

                                weight:
                                    isSulgipe
                                        ? 1
                                        : 1.5,

                                fillOpacity:
                                    isSulgipe
                                        ? 0.5
                                        : 0.3
                            };
                        },

                    onEachFeature:
                        (
                            feature,
                            layer
                        ) => {
                            if (
                                feature
                                    .properties
                                    ?.name
                            ) {
                                layer.bindTooltip(
                                    `MUNICÍPIO: ${feature.properties.name}`
                                );
                            }
                        }
                }
            ).addTo(map);
        }
    )
    .catch(
        error => {
            console.error(
                "Erro ao carregar GeoJSON dos municípios:",
                error
            );
        }
    );

// =====================================================================
// 6. DADOS DAS UNIDADES
// =====================================================================

// =====================================================================
// 6. DADOS DAS UNIDADES
// =====================================================================

let todasBasesFisicas = [];


// =====================================================================
// CARREGAR IMÓVEIS DO JSON
// =====================================================================

async function carregarImoveis() {

    try {

        const resposta =
            await fetch("./imoveis.json");

        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status} ao carregar imoveis.json`
            );

        }

        const imoveis =
            await resposta.json();


        // =============================================================
        // VALIDAR FORMATO
        // =============================================================

        if (!Array.isArray(imoveis)) {

            throw new Error(
                "imoveis.json não contém um array."
            );

        }


        // =============================================================
        // CONVERTER PARA O FORMATO UTILIZADO PELO MAPA
        // =============================================================

        todasBasesFisicas =
            imoveis

                .filter(
                    imovel =>

                        imovel.status === "ATIVO" &&

                        Number.isFinite(
                            Number(imovel.latitude)
                        ) &&

                        Number.isFinite(
                            Number(imovel.longitude)
                        )
                )

                .map(
                    imovel => {

                        const categorias =
                            Array.isArray(
                                imovel.categorias
                            )
                                ? imovel.categorias
                                : [];


                        return {

                            // -------------------------------------------------
                            // IDENTIFICAÇÃO
                            // -------------------------------------------------

                            id:
                                imovel.id,

                            nome:
                                obterNomeImovel(
                                    imovel
                                ),


                            // -------------------------------------------------
                            // LOCALIZAÇÃO
                            // -------------------------------------------------

                            endereco:
                                imovel.endereco ||
                                `${imovel.municipio || ""} - ${imovel.uf || ""}`,

                            lat:
                                Number(
                                    imovel.latitude
                                ),

                            lng:
                                Number(
                                    imovel.longitude
                                ),


                            // -------------------------------------------------
                            // INFORMAÇÕES DO IMÓVEL
                            // -------------------------------------------------

                            municipio:
                                imovel.municipio || "",

                            propriedade:
                                imovel.propriedade || "",

                            tipoUtilizacao:
                                imovel.tipoUtilizacao || "",

                            categorias:
                                categorias,

                            agencia:
                                imovel.agencia || "",

                            coordenadaAproximada:
                                imovel.coordenadaAproximada === true,


                            // -------------------------------------------------
                            // MANTER DADOS ORIGINAIS
                            // -------------------------------------------------

                            dadosOriginais:
                                imovel

                        };

                    }
                );


        console.log(
            "Imóveis carregados do JSON:",
            todasBasesFisicas.length
        );


        console.log(
            "Unidades:",
            todasBasesFisicas
        );


        return todasBasesFisicas;


    } catch (erro) {

        console.error(
            "Erro ao carregar imoveis.json:",
            erro
        );

        throw erro;

    }

}


// =====================================================================
// NOME DO IMÓVEL
// =====================================================================

function obterNomeImovel(
    imovel
) {

    const complemento =
        String(
            imovel.complemento || ""
        ).trim();


    const municipio =
        String(
            imovel.municipio || ""
        ).trim();


    // -------------------------------------------------------------
    // Se tiver complemento útil
    // -------------------------------------------------------------

    if (
        complemento &&
        complemento !== "-" &&
        complemento.toUpperCase() !== "N/A"
    ) {

        return (
            `${complemento} - ${municipio}`
        );

    }


    // -------------------------------------------------------------
    // Caso contrário
    // -------------------------------------------------------------

    return (
        `${imovel.tipoUtilizacao || "Imóvel"} - ${municipio}`
    );

}


// =====================================================================
// 7. CAMADAS DO MAPA
// =====================================================================


// =====================================================================
// CAMADAS DO MAPA
// =====================================================================

const camadas = {

    "Subestações":
        L.layerGroup().addTo(map),

    "Bases Operacionais":
        L.layerGroup().addTo(map),

    "Sedes Administrativas":
        L.layerGroup().addTo(map),

    "Agências de Atendimento":
        L.layerGroup().addTo(map),

    "Almoxarifados":
        L.layerGroup().addTo(map)

};

// =====================================================================
// RELAÇÃO ENTRE CATEGORIA DO JSON E CAMADA
// =====================================================================

const categoriaParaCamada = {

    "SUBESTACAO":
        "Subestações",

    "BASE_OPERACIONAL":
        "Bases Operacionais",

    "AGENCIA":
        "Agências de Atendimento",

    "ADMINISTRATIVO":
        "Sedes Administrativas",

    "ALMOXARIFADO":
        "Almoxarifados",

    "REPETIDORA":
        "Sedes Administrativas",

    "GARAGEM":
        "Bases Operacionais",

    "SECCIONADORA":
        "Subestações",

    "CENTRO_CULTURAL":
        "Sedes Administrativas"

};


// =====================================================================
// CAMADAS DE CADA IMÓVEL
// =====================================================================

function obterCamadasDoImovel(
    imovel
) {

    const resultado =
        new Set();


    const categorias =
        Array.isArray(
            imovel.categorias
        )
            ? imovel.categorias
            : [];


    categorias.forEach(
        categoria => {

            const camada =
                categoriaParaCamada[
                    categoria
                ];


            if (camada) {

                resultado.add(
                    camada
                );

            }

        }
    );


    return [
        ...resultado
    ];

}


// =====================================================================
// MARCADORES
// =====================================================================

window.marcadoresGlobais = {};


// =====================================================================
// TIPO PRINCIPAL DO IMÓVEL
// =====================================================================

function obterTipoPrincipal(
    imovel
) {

    const categorias =
        Array.isArray(
            imovel.categorias
        )
            ? imovel.categorias
            : [];


    // -------------------------------------------------------------
    // Prioridade visual
    // -------------------------------------------------------------

    if (
        categorias.includes(
            "SUBESTACAO"
        )
    ) {

        return "Subestação";

    }


    if (
        categorias.includes(
            "ALMOXARIFADO"
        )
    ) {

        return "Almoxarifado";

    }


    if (
        categorias.includes(
            "BASE_OPERACIONAL"
        )
    ) {

        return "Base Operacional";

    }


    if (
        categorias.includes(
            "ADMINISTRATIVO"
        )
    ) {

        return "Sede Administrativa";

    }


    if (
        categorias.includes(
            "AGENCIA"
        )
    ) {

        return "Agência de Atendimento";

    }


    return "Agência de Atendimento";

}

// =====================================================================
// MARCADORES GLOBAIS
// =====================================================================

window.marcadoresGlobais = {};
// =====================================================================
// 8. CONFIGURAÇÕES DE SLA
// =====================================================================



const LABEL_PRIORIDADE = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    critica: "Crítica"
};

const LABEL_STATUS = {
    andamento: "Em Andamento",
    aguardando: "Aguardando",
    realizado: "Realizado",
    cancelado: "Cancelado"
};


// =====================================================================
// 9. FUNÇÕES DE SLA
// =====================================================================




function prioridadeEhValida(prioridade) {
    const prioridadesValidas = [
        "baixa",
        "media",
        "alta",
        "critica"
    ];

    return prioridadesValidas.includes(
        prioridade
    );
}


function obterLabelPrioridade(
    prioridade
) {
    return (
        LABEL_PRIORIDADE[prioridade] ??
        "Não definida"
    );
}


function obterLabelStatus(
    status
) {
    return (
        LABEL_STATUS[status] ??
        status ??
        "Não informado"
    );
}


function obterInfoSLA(
    servico
) {
    // Chamados antigos podem não ter SLA
    if (!servico.prazoSla) {
        return {
            classe: "sla-sem-info",
            texto: "SLA não definido"
        };
    }

    // Chamado encerrado
    if (
        servico.statusAtual === "realizado" ||
        servico.statusAtual === "cancelado"
    ) {
        return {
            classe: "sla-finalizado",
            texto: "Chamado encerrado"
        };
    }

    const prazo =
        new Date(
            servico.prazoSla
        );

    if (
        Number.isNaN(
            prazo.getTime()
        )
    ) {
        return {
            classe: "sla-sem-info",
            texto: "SLA não definido"
        };
    }

    const diferencaMs =
        prazo.getTime() -
        Date.now();

    const diferencaAbsoluta =
        Math.abs(
            diferencaMs
        );

    const minutosTotais =
        Math.floor(
            diferencaAbsoluta /
            (1000 * 60)
        );

    const dias =
        Math.floor(
            minutosTotais /
            (60 * 24)
        );

    const horas =
        Math.floor(
            (
                minutosTotais %
                (60 * 24)
            ) /
            60
        );

    const minutos =
        minutosTotais % 60;

    let tempoTexto = "";

    if (dias > 0) {
        tempoTexto =
            `${dias}d ${horas}h`;
    } else if (horas > 0) {
        tempoTexto =
            `${horas}h ${minutos}min`;
    } else {
        tempoTexto =
            `${minutos}min`;
    }

    // SLA vencido
    if (
        diferencaMs < 0
    ) {
        return {
            classe: "sla-vencido",
            texto:
                `Prazo vencido há ${tempoTexto}`
        };
    }

    // Menos de 4 horas restantes
    if (
        diferencaMs <=
        (
            4 *
            60 *
            60 *
            1000
        )
    ) {
        return {
            classe: "sla-alerta",
            texto:
                `Vence em ${tempoTexto}`
        };
    }

    return {
        classe: "sla-ok",
        texto:
            `Prazo: ${tempoTexto} restantes`
    };
}


// =====================================================================
// 10. UTILITÁRIOS DE DATA
// =====================================================================

function formatarDataBR(
    dataString
) {
    if (!dataString) {
        return "--/--/----";
    }

    // Datas vindas de input type="date"
    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            dataString
        )
    ) {
        const [
            ano,
            mes,
            dia
        ] =
            dataString.split("-");

        return (
            `${dia}/${mes}/${ano}`
        );
    }

    const data =
        new Date(
            dataString
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return dataString;
    }

    return data.toLocaleDateString(
        "pt-BR"
    );
}


function formatarDataHoraBR(
    dataString
) {
    if (!dataString) {
        return "-";
    }

    const data =
        new Date(
            dataString
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "-";
    }

    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle:
                "short",

            timeStyle:
                "short"
        }
    );
}


// =====================================================================
// 11. PROTEÇÃO DE TEXTO
// =====================================================================

function escapeHtml(
    valor
) {
    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// =====================================================================
// 12. LOCALIZAR BASE DE UM CHAMADO
// =====================================================================

function obterBaseDoServico(
    servico
) {
    if (
        servico.localId
    ) {
        return (
            todasBasesFisicas.find(
                base =>
                    base.id ===
                    servico.localId
            ) ?? null
        );
    }

    return (
        todasBasesFisicas.find(
            base =>
                base.nome ===
                servico.local
        ) ?? null
    );
}


// =====================================================================
// 13. SITUAÇÃO DO CHAMADO
// =====================================================================

function chamadoEstaAtivo(
    servico
) {
    return ![
        "realizado",
        "cancelado"
    ].includes(
        servico.statusAtual
    );
}


function chamadoEstaAtrasado(
    servico
) {
    if (
        !chamadoEstaAtivo(
            servico
        ) ||
        !servico.prazoSla
    ) {
        return false;
    }

    const prazo =
        new Date(
            servico.prazoSla
        );

    return (
        !Number.isNaN(
            prazo.getTime()
        ) &&
        prazo.getTime() <
        Date.now()
    );
}


// =====================================================================
// 14. ESTADO VISUAL DOS MARCADORES
// =====================================================================

window.verificarEAtualizarMarcador =
function (
    baseId,
    nomeBase
) {
    const marcador =
        window.marcadoresGlobais[
            baseId
        ];

    if (
        !marcador ||
        !marcador._icon
    ) {
        return;
    }

    let temAndamento =
        false;

    let temAguardando =
        false;

    let temAtrasado =
        false;

    dadosTerceirizados.forEach(
        empresa => {

            (
                empresa.servicos ??
                []
            ).forEach(
                servico => {

                    const pertenceAoLocal =
                        servico.localId ===
                        baseId ||
                        servico.local ===
                        nomeBase;

                    if (
                        !pertenceAoLocal
                    ) {
                        return;
                    }

                    if (
                        chamadoEstaAtrasado(
                            servico
                        )
                    ) {
                        temAtrasado =
                            true;
                    }

                    if (
                        servico.statusAtual ===
                        "andamento"
                    ) {
                        temAndamento =
                            true;
                    }

                    if (
                        servico.statusAtual ===
                        "aguardando"
                    ) {
                        temAguardando =
                            true;
                    }
                }
            );
        }
    );

    marcador._icon.classList.remove(
        "icone-em-andamento",
        "icone-atrasado",
        "icone-aguardando"
    );

    // Ordem de prioridade visual:
    // atrasado > andamento > aguardando

    if (
        temAtrasado
    ) {
        marcador._icon.classList.add(
            "icone-atrasado"
        );
    } else if (
        temAndamento
    ) {
        marcador._icon.classList.add(
            "icone-em-andamento"
        );
    } else if (
        temAguardando
    ) {
        marcador._icon.classList.add(
            "icone-aguardando"
        );
    }
};


// =====================================================================
// 15. CÁLCULO DE DISTÂNCIA - HAVERSINE
// =====================================================================

function calcularDistanciaHaversine(
    lat1,
    lon1,
    lat2,
    lon2
) {
    const R =
        6371;

    const dLat =
        (
            lat2 - lat1
        ) *
        (
            Math.PI /
            180
        );

    const dLon =
        (
            lon2 - lon1
        ) *
        (
            Math.PI /
            180
        );

    const a =
        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            lat1 *
            (
                Math.PI /
                180
            )
        ) *

        Math.cos(
            lat2 *
            (
                Math.PI /
                180
            )
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(
                1 - a
            )
        );

    return (
        R * c
    );
}


// =====================================================================
// 16. DISTÂNCIA RODOVIÁRIA
// =====================================================================

async function calcularDistanciaRodoviaria(
    origem,
    destino
) {
    const url =
        "https://router.project-osrm.org/route/v1/driving/" +
        `${origem.lng},${origem.lat};` +
        `${destino.lng},${destino.lat}` +
        "?overview=false";

    try {
        const resposta =
            await fetch(
                url
            );

        if (
            !resposta.ok
        ) {
            throw new Error(
                `OSRM retornou HTTP ${resposta.status}`
            );
        }

        const dados =
            await resposta.json();

        if (
            dados.code ===
            "Ok" &&
            dados.routes?.[0]
        ) {
            return (
                dados.routes[0]
                    .distance /
                1000
            );
        }
    } catch (erro) {
        console.warn(
            "Não foi possível calcular a rota real. Usando distância em linha reta.",
            erro
        );
    }

    // fallback
    return calcularDistanciaHaversine(
        origem.lat,
        origem.lng,
        destino.lat,
        destino.lng
    );
}
// =====================================================================
// 17. CRIAÇÃO DOS MARCADORES COM DISTÂNCIA RODOVIÁRIA
// =====================================================================

async function criarMarcadoresComDistanciaReal() {

    console.log(
        "Criando marcadores dos imóveis..."
    );


    // ================================================================
    // 1. CALCULAR DISTÂNCIAS
    // ================================================================

    const distancias =
        await Promise.all(

            todasBasesFisicas.map(

                base =>

                    calcularDistanciaRodoviaria(

                        COORD_SEDE,

                        {
                            lat:
                                base.lat,

                            lng:
                                base.lng
                        }

                    )

            )

        );


    // ================================================================
    // 2. LIMPAR MARCADORES ANTERIORES
    // ================================================================

    if (
        window.marcadoresGlobais
    ) {

        Object.values(
            window.marcadoresGlobais
        ).forEach(

            marker => {

                if (
                    marker &&
                    map.hasLayer(marker)
                ) {

                    map.removeLayer(
                        marker
                    );

                }

            }

        );

    }


    window.marcadoresGlobais = {};


    // ================================================================
    // 3. CRIAR MARCADORES
    // ================================================================

    todasBasesFisicas.forEach(

        (base, indice) => {


            // ========================================================
            // TIPO PRINCIPAL
            // ========================================================

            const tipoPrincipal =
                obterTipoPrincipal(
                    base
                );


            // ========================================================
            // CATEGORIAS
            // ========================================================

            const categorias =
                Array.isArray(
                    base.categorias
                )
                    ? base.categorias
                    : [];


            // ========================================================
            // ÍCONE
            // ========================================================

            const iconeCorreto =

                mapIconTypes[
                    tipoPrincipal
                ] ||

                new L.Icon.Default();


            // ========================================================
            // DISTÂNCIA
            // ========================================================

            const distanciaKm =

                Number(
                    distancias[
                        indice
                    ]
                ).toFixed(1);


            // ========================================================
            // MARCADOR
            // ========================================================

            const marker =

                L.marker(

                    [
                        base.lat,
                        base.lng
                    ],

                    {
                        icon:
                            iconeCorreto
                    }

                );


            // ========================================================
            // GUARDAR DADOS NO MARCADOR
            // ========================================================

            marker.geoFacilitiesData = {

                id:
                    base.id,

                categorias:
                    categorias,

                tipo:
                    tipoPrincipal,

                municipio:
                    base.municipio,

                status:
                    base.dadosOriginais?.status ||
                    "ATIVO"

            };


            // ========================================================
            // ATUALIZAR STATUS DO MARCADOR
            // ========================================================

            marker.on(

                "add",

                () => {

                    window.verificarEAtualizarMarcador(

                        base.id,

                        base.nome

                    );

                }

            );


            // ========================================================
            // REGISTRAR MARCADOR
            // ========================================================

            window.marcadoresGlobais[
                base.id
            ] = marker;


            // ========================================================
            // EMPRESAS
            // ========================================================

            const optionsEmpresas =

                dadosTerceirizados

                    .map(

                        empresa =>

                            `
                            <option value="${escapeHtml(empresa.id)}">

                                ${escapeHtml(empresa.nome)}

                            </option>
                            `

                    )

                    .join("");


            // ========================================================
            // CATEGORIAS FORMATADAS
            // ========================================================

            const categoriasTexto =

                categorias.length

                    ? categorias
                        .map(

                            categoria => {

                                const nomes = {

                                    "AGENCIA":
                                        "Agência",

                                    "BASE_OPERACIONAL":
                                        "Base Operacional",

                                    "SUBESTACAO":
                                        "Subestação",

                                    "ADMINISTRATIVO":
                                        "Administrativo",

                                    "ALMOXARIFADO":
                                        "Almoxarifado",

                                    "REPETIDORA":
                                        "Repetidora",

                                    "GARAGEM":
                                        "Garagem",

                                    "SECCIONADORA":
                                        "Seccionadora",

                                    "CENTRO_CULTURAL":
                                        "Centro Cultural",

                                    "FAIXA_SERVIDAO":
                                        "Faixa de Servidão"

                                };


                                return (

                                    nomes[
                                        categoria
                                    ] ||

                                    categoria

                                );

                            }

                        )
                        .join(" • ")

                    : tipoPrincipal;


            // ========================================================
            // POPUP
            // ========================================================

            const popupContent = `

                <div class="modern-popup">


                    <!-- TIPO -->

                    <span class="tag">

                        ${escapeHtml(
                            categoriasTexto
                        )}

                    </span>


                    <!-- NOME -->

                    <h3>

                        ${escapeHtml(
                            base.nome
                        )}

                    </h3>


                    <!-- MUNICÍPIO -->

                    <div class="info-row">

                        <strong>
                            Município:
                        </strong>

                        <span>

                            ${escapeHtml(
                                base.municipio || "-"
                            )}

                        </span>

                    </div>


                    <!-- DISTÂNCIA -->

                    <div class="info-row">

                        <strong>
                            Distância:
                        </strong>

                        <span>

                            ${distanciaKm}
                            km da sede
                            (por rodovia)

                        </span>

                    </div>


                    <!-- ENDEREÇO -->

                    <div class="info-row">

                        <strong>
                            Endereço:
                        </strong>

                        <span>

                            ${escapeHtml(
                                base.endereco || "-"
                            )}

                        </span>

                    </div>


                    <!-- PROPRIEDADE -->

                    <div class="info-row">

                        <strong>
                            Propriedade:
                        </strong>

                        <span>

                            ${escapeHtml(
                                base.propriedade || "-"
                            )}

                        </span>

                    </div>


                    <!-- TIPO DE UTILIZAÇÃO -->

                    <div class="info-row">

                        <strong>
                            Utilização:
                        </strong>

                        <span>

                            ${escapeHtml(
                                base.tipoUtilizacao || "-"
                            )}

                        </span>

                    </div>


                    <!-- COORDENADAS -->

                    <div class="info-row">

                        <strong>
                            Coordenadas:
                        </strong>

                        <span>

                            ${Number(
                                base.lat
                            ).toFixed(5)},

                            ${Number(
                                base.lng
                            ).toFixed(5)}

                        </span>

                    </div>


                    ${
                        base.coordenadaAproximada

                            ? `

                                <div
                                    style="
                                        margin-top:8px;
                                        padding:7px;
                                        background:#fff7ed;
                                        border-radius:6px;
                                        color:#9a3412;
                                        font-size:.75rem;
                                    "
                                >

                                    ⚠️
                                    Coordenada aproximada
                                    pela localização
                                    municipal.

                                </div>

                            `

                            : ""
                    }


                    <hr>


                    <!-- FORMULÁRIO -->

                    <label
                        style="
                            font-size:.78rem;
                            color:#004b6b;
                            font-weight:800;
                            display:block;
                            margin-bottom:8px;
                        "
                    >

                        Vincular Serviço / Ocorrência

                    </label>


                    <!-- EMPRESA -->

                    <select

                        id="empresa-${base.id}"

                        class="popup-select"

                    >

                        <option

                            value=""
                            disabled
                            selected

                        >

                            Selecione a Empresa Parceira

                        </option>


                        ${optionsEmpresas}

                    </select>


                    <!-- TIPO DE SERVIÇO -->

                    <label>

                        Tipo de Serviço

                    </label>


                    <select

                        id="tipo-servico-${base.id}"

                        class="popup-select"

                        onchange="
                            atualizarChecklist(
                                '${base.id}'
                            )
                        "

                    >

                        <option

                            value=""
                            disabled
                            selected

                        >

                            Selecione o tipo de serviço

                        </option>


                        <option value="civil">

                            Reforma Civil / Predial

                        </option>


                        <option value="climatizacao">

                            Ar-Condicionado / PMOC

                        </option>


                        <option value="eletrica">

                            Manutenção Elétrica / Subestação

                        </option>

                    </select>


                    <!-- CHECKLIST -->

                    <div

                        id="
                            checklist-container-${base.id}
                        "

                        style="
                            display:none;
                            margin-bottom:10px;
                            font-size:.85em;
                            background:#f1f5f9;
                            padding:10px;
                            border-radius:6px;
                            border:1px solid #e2e8f0;
                            color:#334155;
                        "

                    ></div>


                    <!-- PRIORIDADE -->

                    <label>

                        Prioridade

                    </label>


                    <select

                        id="prioridade-${base.id}"

                        class="popup-select"

                    >

                        <option value="baixa">

                            🟢 Prioridade Baixa

                        </option>


                        <option

                            value="media"
                            selected

                        >

                            🟡 Prioridade Média

                        </option>


                        <option value="alta">

                            🟠 Prioridade Alta

                        </option>


                        <option value="critica">

                            🔴 Prioridade Crítica

                        </option>

                    </select>


                    <!-- STATUS -->

                    <select

                        id="status-${base.id}"

                        class="popup-select"

                    >

                        <option value="andamento">

                            Em Andamento

                        </option>


                        <option value="aguardando">

                            Aguardando Peça/Aprovação

                        </option>


                        <option value="realizado">

                            Realizado

                        </option>


                        <option value="cancelado">

                            Cancelado

                        </option>

                    </select>


                    <!-- CHAMADO -->

                    <label

                        style="
                            font-size:.75em;
                            color:#475569;
                            display:block;
                            margin-bottom:4px;
                        "

                    >

                        Nº do Chamado

                    </label>


                    <input

                        type="text"

                        id="chamado-${base.id}"

                        class="popup-select"

                        placeholder="Ex: 123456"

                    >


                    <!-- DATA -->

                    <label

                        style="
                            font-size:.75em;
                            color:#475569;
                            display:block;
                            margin-bottom:4px;
                        "

                    >

                        Data do chamado

                    </label>


                    <input

                        type="date"

                        id="data-${base.id}"

                        class="popup-select"

                        style="
                            margin-bottom:10px;
                            cursor:pointer;
                        "

                    >


                    <!-- PRAZO -->

                    <label

                        style="
                            font-size:.75em;
                            color:#475569;
                            display:block;
                            margin-bottom:4px;
                        "

                    >

                        Prazo / vencimento do chamado

                    </label>


                    <input

                        type="datetime-local"

                        id="prazo-${base.id}"

                        class="popup-select"

                        style="
                            margin-bottom:10px;
                            cursor:pointer;
                        "

                    >


                    <!-- DESCRIÇÃO -->

                    <label

                        style="
                            font-size:.75em;
                            color:#475569;
                            display:block;
                            margin-bottom:4px;
                        "

                    >

                        Descrição

                    </label>


                    <textarea

                        id="desc-${base.id}"

                        placeholder="Descrição do serviço..."

                    ></textarea>


                    <!-- EVIDÊNCIA -->

                    <label

                        style="
                            font-size:.8em;
                            color:#555;
                            display:block;
                            margin-top:5px;
                            margin-bottom:2px;
                        "

                    >

                        <b>

                            Anexar Evidência (Foto):

                        </b>

                    </label>


                    <input

                        type="file"

                        id="evidencia-${base.id}"

                        accept="image/*"

                        style="
                            width:100%;
                            font-size:.8em;
                            margin-bottom:12px;
                        "

                    >


                    <!-- BOTÃO -->

                    <button

                        type="button"

                        onclick="
                            registrarServico(
                                event,
                                '${base.id}',
                                decodeURIComponent(
                                    '${encodeURIComponent(base.nome)}'
                                )
                            )
                        "

                        class="btn-link"

                        style="
                            background-color:#f26522;
                            color:white;
                            border:none;
                            width:100%;
                            padding:10px;
                            border-radius:4px;
                            cursor:pointer;
                            font-weight:bold;
                        "

                    >

                        Registrar Serviço

                    </button>


                </div>

            `;


            // ========================================================
            // VINCULAR POPUP
            // ========================================================

            marker.bindPopup(
                popupContent
            );


            // ========================================================
            // ADICIONAR AO MAPA
            //
            // IMPORTANTE:
            // Um mesmo marker NÃO será colocado em várias
            // LayerGroups, pois isso causa conflito no Leaflet
            // quando uma camada é ocultada.
            //
            // A categoria será armazenada no marker e os
            // filtros poderão trabalhar sobre ela.
            // ========================================================

            marker.addTo(
                map
            );


        }

    );


    console.log(
        "Marcadores criados:",
        Object.keys(
            window.marcadoresGlobais
        ).length
    );

}


// =====================================================================
// 18. CHECKLIST DINÂMICO
// =====================================================================

window.atualizarChecklist =
function (baseId) {
    const select =
        document.getElementById(
            `tipo-servico-${baseId}`
        );

    const container =
        document.getElementById(
            `checklist-container-${baseId}`
        );

    if (
        !select ||
        !container
    ) {
        return;
    }

    const tipo =
        select.value;

    let html = "";

    if (
        tipo ===
        "civil"
    ) {
        html = `
            <strong
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#004b6b;
                "
            >
                Checklist de Segurança (Obrigatório):
            </strong>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Isolamento da área realizado
            </label>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                EPIs completos utilizados
            </label>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Entulho recolhido/descartado corretamente
            </label>
        `;
    }

    if (
        tipo ===
        "climatizacao"
    ) {
        html = `
            <strong
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#004b6b;
                "
            >
                Checklist Operacional (Obrigatório):
            </strong>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Limpeza de filtros realizada
            </label>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Verificação de gás refrigerante (Pressão OK)
            </label>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Teste de dreno desobstruído concluído
            </label>
        `;
    }

    if (
        tipo ===
        "eletrica"
    ) {
        html = `
            <strong
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#004b6b;
                "
            >
                Regras de Ouro (Obrigatório):
            </strong>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Desenergização / Seccionamento confirmado
            </label>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Travamento e bloqueio aplicados (LOTO)
            </label>

            <label
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:4px;
                "
            >
                <input
                    type="checkbox"
                    class="chk-${baseId}"
                >

                Teste de ausência de tensão realizado
            </label>
        `;
    }

    if (
        html
    ) {
        container.innerHTML =
            html;

        container.style.display =
            "block";
    } else {
        container.innerHTML =
            "";

        container.style.display =
            "none";
    }
};


// =====================================================================
// 19. UPLOAD DE EVIDÊNCIA
// =====================================================================

async function enviarFotoImgBB(
    file
) {
    // IMPORTANTE:
    // A chave continua no frontend para manter
    // compatibilidade com a versão atual.
    // Em produção, o ideal é mover isso para
    // backend ou Firebase Storage.

    const API_KEY =
        "3f159529a71f1e4c44c57132ad219a99";

    const url =
        `https://api.imgbb.com/1/upload?key=${API_KEY}`;

    const formData =
        new FormData();

    formData.append(
        "image",
        file
    );

    const response =
        await fetch(
            url,
            {
                method:
                    "POST",

                body:
                    formData
            }
        );

    if (
        !response.ok
    ) {
        throw new Error(
            `Falha no upload da imagem (HTTP ${response.status}).`
        );
    }

    const data =
        await response.json();

    if (
        !data.success ||
        !data.data?.url
    ) {
        throw new Error(
            "Erro ao fazer upload da imagem no ImgBB."
        );
    }

    return data.data.url;
}
// =====================================================================
// 20. REGISTRAR CHAMADO
// =====================================================================

window.registrarServico =
async function (
    event,
    baseId,
    nomeBase
) {
    const empresaId =
        document.getElementById(
            `empresa-${baseId}`
        )?.value;

    const tipoServico =
        document.getElementById(
            `tipo-servico-${baseId}`
        )?.value;

    const prioridade =
        document.getElementById(
            `prioridade-${baseId}`
        )?.value ??
        "media";

    const statusServico =
        document.getElementById(
            `status-${baseId}`
        )?.value ??
        "andamento";

    const numeroChamado =
        document.getElementById(
            `chamado-${baseId}`
        )?.value.trim();

    const dataServico =
        document.getElementById(
            `data-${baseId}`
        )?.value;

        const prazoInformado =
        document.getElementById(
            `prazo-${baseId}`
        )?.value;

    const descricao =
        document.getElementById(
            `desc-${baseId}`
        )?.value.trim();

    const inputArquivo =
        document.getElementById(
            `evidencia-${baseId}`
        );

    const arquivo =
        inputArquivo?.files?.[0] ??
        null;


    // ================================================================
    // VALIDAÇÕES BÁSICAS
    // ================================================================

    if (
        !empresaId ||
        !tipoServico ||
        !numeroChamado ||
        !dataServico ||
        !descricao
        
    ) {
        alert(
            "Preencha todos os campos obrigatórios."
        );

        return;
    }


    if (
        !prioridadeEhValida(
            prioridade
        )
    ) {
        alert(
            "Selecione uma prioridade válida."
        );

        return;
    }


    // ================================================================
    // CHECKLIST OBRIGATÓRIO
    // ================================================================

    const checkboxes =
        [
            ...document.querySelectorAll(
                `.chk-${baseId}`
            )
        ];

    if (
        checkboxes.length > 0 &&
        !checkboxes.every(
            checkbox =>
                checkbox.checked
        )
    ) {
        alert(
            "Conclua todos os itens do checklist antes de registrar o chamado."
        );

        return;
    }


    // ================================================================
    // EVITA CHAMADO DUPLICADO
    // ================================================================

    const numeroNormalizado =
        numeroChamado
            .trim()
            .toLowerCase();

    const chamadoDuplicado =
        dadosTerceirizados.some(
            empresa =>
                (
                    empresa.servicos ??
                    []
                ).some(
                    servico =>
                        String(
                            servico.chamado ??
                            ""
                        )
                            .trim()
                            .toLowerCase() ===
                        numeroNormalizado
                )
        );

    if (
        chamadoDuplicado
    ) {
        alert(
            `Já existe um chamado com o número #${numeroChamado}.`
        );

        return;
    }


    // ================================================================
    // ESTADO DO BOTÃO
    // ================================================================

    const btn =
        event?.currentTarget ??
        null;

    const textoOriginal =
        btn?.innerHTML ??
        "Registrar Serviço";

    if (
        btn
    ) {
        btn.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Salvando...
            `;

        btn.disabled =
            true;
    }


    try {

        // ============================================================
        // UPLOAD DA FOTO
        // ============================================================

        let urlFoto =
            null;

        if (
            arquivo
        ) {
            if (
                !arquivo.type.startsWith(
                    "image/"
                )
            ) {
                throw new Error(
                    "O arquivo selecionado não é uma imagem."
                );
            }

            const tamanhoMaximo =
                8 *
                1024 *
                1024;

            if (
                arquivo.size >
                tamanhoMaximo
            ) {
                throw new Error(
                    "A imagem deve ter no máximo 8 MB."
                );
            }

            urlFoto =
                await enviarFotoImgBB(
                    arquivo
                );
        }


        // ============================================================
        // LOCALIZAR EMPRESA
        // ============================================================

        const empresa =
            dadosTerceirizados.find(
                item =>
                    item.id ===
                    empresaId
            );

        if (
            !empresa
        ) {
            throw new Error(
                "Empresa não encontrada."
            );
        }

        if (
            !Array.isArray(
                empresa.servicos
            )
        ) {
            empresa.servicos =
                [];
        }


        // ============================================================
        // CALCULAR SLA
        // ============================================================

        const criadoEm =
            new Date().toISOString();
            const prazoSla =
            new Date(
                prazoInformado
            ).toISOString();
        // ============================================================
        // NOVO CHAMADO
        // ============================================================

        const novoServico = {
            id:
                `sv-${Date.now()}-` +
                Math.random()
                    .toString(36)
                    .slice(
                        2,
                        7
                    ),

            chamado:
                numeroChamado,

            tipoServico:
                tipoServico,

            prioridade:
                prioridade,

            statusAtual:
                statusServico,

            localId:
                baseId,

            local:
                nomeBase,

            desc:
                descricao,

            foto:
                urlFoto,

            criadoEm:
                criadoEm,

            prazoSla:
                prazoSla,

            historico: [
                {
                    status:
                        statusServico,

                    data:
                        dataServico,

                    registradoEm:
                        criadoEm
                }
            ]
        };


        // ============================================================
        // ADICIONAR LOCALMENTE
        // ============================================================

        empresa.servicos.push(
            novoServico
        );


        // ============================================================
        // SALVAR NO FIRESTORE
        // ============================================================

        try {
            await window.salvarDadosGlobais();
        } catch (
            erroSalvar
        ) {
            // Se o Firestore falhar,
            // desfaz a inclusão local.

            empresa.servicos =
                empresa.servicos.filter(
                    item =>
                        item.id !==
                        novoServico.id
                );

            throw erroSalvar;
        }


        // ============================================================
        // ATUALIZAR MARCADOR
        // ============================================================

        window.verificarEAtualizarMarcador(
            baseId,
            nomeBase
        );


        // ============================================================
        // LIMPAR CAMPOS
        // ============================================================

        const idsParaLimpar = [
            `empresa-${baseId}`,
            `tipo-servico-${baseId}`,
            `chamado-${baseId}`,
            `data-${baseId}`,
            `prazo-${baseId}`,
            `desc-${baseId}`
         
        ];

        idsParaLimpar.forEach(
            id => {
                const elemento =
                    document.getElementById(
                        id
                    );

                if (
                    elemento
                ) {
                    elemento.value =
                        "";
                }
            }
        );


        // ============================================================
        // RESTAURAR PRIORIDADE PADRÃO
        // ============================================================

        const prioridadeEl =
            document.getElementById(
                `prioridade-${baseId}`
            );

        if (
            prioridadeEl
        ) {
            prioridadeEl.value =
                "media";
        }


        // ============================================================
        // RESTAURAR STATUS PADRÃO
        // ============================================================

        const statusEl =
            document.getElementById(
                `status-${baseId}`
            );

        if (
            statusEl
        ) {
            statusEl.value =
                "andamento";
        }


        // ============================================================
        // LIMPAR ARQUIVO
        // ============================================================

        if (
            inputArquivo
        ) {
            inputArquivo.value =
                "";
        }


        // ============================================================
        // LIMPAR CHECKLIST
        // ============================================================

        const checklist =
            document.getElementById(
                `checklist-container-${baseId}`
            );

        if (
            checklist
        ) {
            checklist.innerHTML =
                "";

            checklist.style.display =
                "none";
        }


        // ============================================================
        // ATUALIZAR BARRA LATERAL
        // ============================================================

        window.renderizarTerceirizados();


        // ============================================================
        // ABRIR ÁREA DAS EMPRESAS
        // ============================================================

        const lista =
            document.getElementById(
                "lista-terceirizados"
            );

        const botaoLista =
            document.getElementById(
                "btn-terceirizados"
            );

        lista?.classList.add(
            "mostrar"
        );

        botaoLista?.classList.add(
            "ativo"
        );


        // Abre automaticamente a empresa
        // do chamado recém-criado.

        setTimeout(
            () =>
                window.toggleTerceirizado(
                    empresaId
                ),
            100
        );


        // ============================================================
        // CONFIRMAÇÃO
        // ============================================================

        alert(
            `Chamado #${numeroChamado} registrado com sucesso!`
        );

    } catch (
        erro
    ) {
        console.error(
            "Erro ao registrar chamado:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível registrar o chamado."
        );

    } finally {

        if (
            btn
        ) {
            btn.innerHTML =
                textoOriginal;

            btn.disabled =
                false;
        }
    }
};


// =====================================================================
// 21. EXCLUIR CHAMADO
// =====================================================================

window.deletarServico =
async function (
    empresaId,
    servicoId
) {
    const empresa =
        dadosTerceirizados.find(
            item =>
                item.id ===
                empresaId
        );

    if (!empresa) {
        alert(
            "Empresa não encontrada."
        );

        return;
    }

    const servico =
        (
            empresa.servicos ??
            []
        ).find(
            item =>
                item.id ===
                servicoId
        );

    if (!servico) {
        alert(
            "Chamado não encontrado."
        );

        return;
    }

    const confirmar =
        confirm(
            `Excluir o chamado #${servico.chamado}?\n\n` +
            `${servico.local}\n\n` +
            "Esta ação não poderá ser desfeita."
        );

    if (
        !confirmar
    ) {
        return;
    }

    // Backup local para restaurar
    // caso o Firestore falhe.

    const backup =
        [
            ...empresa.servicos
        ];

    try {

        empresa.servicos =
            empresa.servicos.filter(
                item =>
                    item.id !==
                    servicoId
            );

        await window.salvarDadosGlobais();


        // ============================================================
        // ATUALIZAR MARCADOR
        // ============================================================

        const base =
            obterBaseDoServico(
                servico
            );

        if (
            base
        ) {
            window.verificarEAtualizarMarcador(
                base.id,
                base.nome
            );
        }


        // ============================================================
        // ATUALIZAR INTERFACE
        // ============================================================

        window.renderizarTerceirizados();


        alert(
            `Chamado #${servico.chamado} excluído com sucesso.`
        );

    } catch (
        erro
    ) {

        // Se der erro, restaura
        // o conteúdo original.

        empresa.servicos =
            backup;

        console.error(
            "Erro ao excluir chamado:",
            erro
        );

        alert(
            "Não foi possível excluir o chamado. Nenhum dado foi removido."
        );
    }
};


// =====================================================================
// 22. ALTERAR STATUS DO CHAMADO
// =====================================================================

// =====================================================================
// ALTERAR STATUS DO CHAMADO
// =====================================================================

window.mudarStatusServico =
async function (
    empresaId,
    servicoId
) {

    const select =
        document.getElementById(
            `select-status-${servicoId}`
        );

    const inputData =
        document.getElementById(
            `input-data-${servicoId}`
        );

    const botao =
        document.getElementById(
            `btn-status-${servicoId}`
        );


    // ================================================================
    // VERIFICAR ELEMENTOS
    // ================================================================

    if (!select) {

        console.error(
            "Select de status não encontrado:",
            servicoId
        );

        alert(
            "Erro ao localizar o campo de status."
        );

        return;
    }


    if (!inputData) {

        console.error(
            "Campo de data não encontrado:",
            servicoId
        );

        alert(
            "Erro ao localizar o campo de data."
        );

        return;
    }


    const novoStatus =
        select.value;

    const novaData =
        inputData.value;


    // ================================================================
    // VALIDAÇÃO
    // ================================================================

    if (!novaData) {

        alert(
            "Selecione a data dessa alteração."
        );

        return;
    }


    // ================================================================
    // LOCALIZAR EMPRESA
    // ================================================================

    const empresa =
        dadosTerceirizados.find(
            item =>
                item.id === empresaId
        );

    if (!empresa) {

        alert(
            "Empresa não encontrada."
        );

        return;
    }


    // ================================================================
    // LOCALIZAR CHAMADO
    // ================================================================

    const servico =
        (
            empresa.servicos || []
        ).find(
            item =>
                item.id === servicoId
        );

    if (!servico) {

        alert(
            "Chamado não encontrado."
        );

        return;
    }


    // ================================================================
    // NÃO FAZER ALTERAÇÃO REPETIDA
    // ================================================================

    if (
        servico.statusAtual === novoStatus
    ) {

        alert(
            "O chamado já está com esse status."
        );

        return;
    }


    // ================================================================
    // BACKUP
    // ================================================================

    const statusAnterior =
        servico.statusAtual;

    const historicoAnterior =
        [
            ...(servico.historico || [])
        ];


    // ================================================================
    // BOTÃO CARREGANDO
    // ================================================================

    const textoOriginal =
        botao?.innerHTML;

    if (botao) {

        botao.disabled =
            true;

        botao.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Salvando...
        `;
    }


    try {

        // ============================================================
        // ALTERAR STATUS
        // ============================================================

        servico.statusAtual =
            novoStatus;


        if (
            !Array.isArray(
                servico.historico
            )
        ) {

            servico.historico =
                [];
        }


        // ============================================================
        // HISTÓRICO
        // ============================================================

        servico.historico.push({

            status:
                novoStatus,

            data:
                novaData,

            registradoEm:
                new Date().toISOString()

        });


        // ============================================================
        // SALVAR FIREBASE
        // ============================================================

        await window.salvarDadosGlobais();


        console.log(
            "Status salvo no Firebase:",
            novoStatus
        );


        // ============================================================
        // ENVIAR E-MAIL
        // SOMENTE QUANDO O STATUS FOR REALIZADO
        // ============================================================

        if (
            novoStatus === "realizado"
        ) {

            console.log(
                "Status é REALIZADO. Vou chamar o EmailJS."
            );


            try {

                const resultadoEmail =
                    await window.enviarEmailChamadoRealizado(
                        empresa,
                        servico
                    );


                console.log(
                    "Resultado do envio:",
                    resultadoEmail
                );


                if (!resultadoEmail) {

                    console.warn(
                        "O chamado foi salvo, mas o e-mail não foi enviado."
                    );

                }

            } catch (erroEmail) {

                console.error(
                    "Erro no envio do e-mail:",
                    erroEmail
                );

                /*
                 * IMPORTANTE:
                 *
                 * Não vamos desfazer o status do chamado
                 * caso apenas o e-mail falhe.
                 *
                 * O Firebase já salvou corretamente.
                 */

            }

        }


        // ============================================================
        // ATUALIZAR MARCADOR
        // ============================================================

        const base =
            obterBaseDoServico(
                servico
            );

        if (base) {

            window.verificarEAtualizarMarcador(
                base.id,
                base.nome
            );

        }


        // ============================================================
        // FEEDBACK SEM ALERT
        // ============================================================

        if (botao) {

            botao.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Atualizado
            `;

            botao.style.background =
                "#16a34a";

        }


        // ============================================================
        // ATUALIZAR INTERFACE
        // ============================================================

        setTimeout(
            () => {

                window.renderizarTerceirizados();

            },
            800
        );


    } catch (erro) {

        // ============================================================
        // RESTAURAR CASO FIREBASE FALHE
        // ============================================================

        servico.statusAtual =
            statusAnterior;

        servico.historico =
            historicoAnterior;


        console.error(
            "Erro ao atualizar status:",
            erro
        );


        if (botao) {

            botao.innerHTML =
                textoOriginal;

            botao.disabled =
                false;

            botao.style.background =
                "";

        }


        alert(
            "Não foi possível atualizar o status."
        );

    }

};

// =====================================================================
// 23. ABRIR EVIDÊNCIA EM NOVA GUIA
// =====================================================================

window.abrirEvidencia =
function (
    urlCodificada
) {
    if (
        !urlCodificada
    ) {
        return;
    }

    try {

        const url =
            decodeURIComponent(
                urlCodificada
            );

        const novaAba =
            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        if (
            !novaAba
        ) {
            alert(
                "O navegador bloqueou a nova guia. Permita pop-ups para abrir a evidência."
            );
        }

    } catch (
        erro
    ) {
        console.error(
            "Erro ao abrir evidência:",
            erro
        );

        alert(
            "Não foi possível abrir a evidência."
        );
    }
};


// =====================================================================
// 24. FOCAR LOCAL NO MAPA
// =====================================================================

window.focarNoMapa =
function (
    localId
) {
    if (
        !localId
    ) {
        return;
    }

    const marker =
        window.marcadoresGlobais[
            localId
        ];

    if (
        !marker
    ) {
        console.warn(
            "Local não encontrado pelo ID:",
            localId
        );

        return;
    }

    map.flyTo(
        marker.getLatLng(),
        16,
        {
            duration:
                1.5
        }
    );

    setTimeout(
        () =>
            marker.openPopup(),
        1500
    );
};


// =====================================================================
// 25. ABRIR / FECHAR EMPRESA NA BARRA LATERAL
// =====================================================================

window.toggleTerceirizado =
function (
    id
) {
    const body =
        document.getElementById(
            `body-${id}`
        );

    const header =
        document.getElementById(
            `header-${id}`
        );

    if (
        !body ||
        !header
    ) {
        return;
    }


    // Se já estiver aberto,
    // apenas fecha.

    if (
        body.classList.contains(
            "mostrar"
        )
    ) {
        body.classList.remove(
            "mostrar"
        );

        header.classList.remove(
            "aberto"
        );

        return;
    }


    // Fecha todos os demais

    document
        .querySelectorAll(
            ".terceirizado-body"
        )
        .forEach(
            elemento =>
                elemento.classList.remove(
                    "mostrar"
                )
        );


    document
        .querySelectorAll(
            ".terceirizado-header"
        )
        .forEach(
            elemento =>
                elemento.classList.remove(
                    "aberto"
                )
        );


    // Abre o escolhido

    body.classList.add(
        "mostrar"
    );

    header.classList.add(
        "aberto"
    );
};
// =====================================================================
// 26. RENDERIZAÇÃO DOS CHAMADOS
// =====================================================================

// =====================================================================
// RENDERIZAÇÃO DOS CHAMADOS
// =====================================================================

window.renderizarTerceirizados = function () {

    const listaTerceirizados =
        document.getElementById(
            "lista-terceirizados"
        );

    if (!listaTerceirizados) {
        return;
    }

    let htmlCards = "";


    // ================================================================
    // PERCORRER EMPRESAS
    // ================================================================

    dadosTerceirizados.forEach(
        empresa => {

            const todosServicos =
                Array.isArray(
                    empresa.servicos
                )
                    ? empresa.servicos
                    : [];


            // ========================================================
            // FILTRO DE BUSCA
            // ========================================================

            const servicos =
                termoBuscaChamado

                    ? todosServicos.filter(
                        servico => {

                            const numero =
                                String(
                                    servico.chamado || ""
                                )
                                    .toLowerCase();

                            const local =
                                String(
                                    servico.local || ""
                                )
                                    .toLowerCase();

                            const descricao =
                                String(
                                    servico.desc || ""
                                )
                                    .toLowerCase();

                            return (
                                numero.includes(
                                    termoBuscaChamado
                                ) ||

                                local.includes(
                                    termoBuscaChamado
                                ) ||

                                descricao.includes(
                                    termoBuscaChamado
                                )
                            );
                        }
                    )

                    : todosServicos;


            // ========================================================
            // DURANTE BUSCA, ESCONDE EMPRESA SEM RESULTADOS
            // ========================================================

            if (
                termoBuscaChamado &&
                servicos.length === 0
            ) {
                return;
            }


            // ========================================================
            // MONTAR CHAMADOS
            // ========================================================

            let htmlServicos =
                servicos
                    .map(
                        servico => {

                            // =========================================
                            // STATUS
                            // =========================================

                            const labelStatusAtual =
                                obterLabelStatus(
                                    servico.statusAtual
                                );


                            // =========================================
                            // PRIORIDADE
                            // =========================================

                            const prioridade =
                                servico.prioridade ||
                                "nao-definida";

                            const labelPrioridade =
                                obterLabelPrioridade(
                                    servico.prioridade
                                );


                            // =========================================
                            // HISTÓRICO
                            // =========================================

                            const historico =
                                Array.isArray(
                                    servico.historico
                                )
                                    ? servico.historico
                                    : [];


                            const htmlHistorico =
                                historico
                                    .map(
                                        item => `
                                            <div class="historico-item">

                                                <i class="fa-regular fa-clock"></i>

                                                <strong>
                                                    ${escapeHtml(
                                                        obterLabelStatus(
                                                            item.status
                                                        )
                                                    )}
                                                </strong>

                                                <span>
                                                    ${escapeHtml(
                                                        formatarDataBR(
                                                            item.data
                                                        )
                                                    )}
                                                </span>

                                            </div>
                                        `
                                    )
                                    .join("");


                            // =========================================
                            // PRAZO
                            // =========================================

                            const infoSLA =
                                obterInfoSLA(
                                    servico
                                );


                            const htmlSLA = `
                                <div
                                    class="
                                        sla-box
                                        ${infoSLA.classe}
                                    "
                                >

                                    <i class="fa-regular fa-clock"></i>

                                    <span>
                                        ${escapeHtml(
                                            infoSLA.texto
                                        )}
                                    </span>

                                </div>
                            `;


                            const htmlPrazo =
                                servico.prazoSla

                                    ? `
                                        <div class="prazo-sla">

                                            Prazo:

                                            <strong>
                                                ${escapeHtml(
                                                    formatarDataHoraBR(
                                                        servico.prazoSla
                                                    )
                                                )}
                                            </strong>

                                        </div>
                                    `

                                    : "";


                            // =========================================
                            // EVIDÊNCIA
                            // =========================================

                            let htmlEvidencia = "";


                            if (servico.foto) {

                                const urlCodificada =
                                    encodeURIComponent(
                                        servico.foto
                                    );


                                htmlEvidencia = `
                                    <button
                                        type="button"
                                        class="
                                            btn-servico
                                            btn-evidencia
                                        "
                                        onclick="
                                            event.stopPropagation();

                                            abrirEvidencia(
                                                '${urlCodificada}'
                                            );
                                        "
                                    >

                                        <i class="fa-solid fa-camera"></i>

                                        Ver evidência

                                    </button>
                                `;
                            }


                            // =========================================
                            // CHAMADO ENCERRADO?
                            // =========================================

                            const chamadoEncerrado =
                                [
                                    "realizado",
                                    "cancelado"
                                ].includes(
                                    servico.statusAtual
                                );


                            // =========================================
                            // ALTERAÇÃO DE STATUS
                            // =========================================

                            let htmlMudarStatus = "";


                            if (!chamadoEncerrado) {

                                htmlMudarStatus = `
                                    <div
                                        class="mudar-status-box"
                                        onclick="
                                            event.stopPropagation()
                                        "
                                    >

                                        <label>
                                            Atualizar chamado
                                        </label>


                                        <select
                                            id="select-status-${servico.id}"
                                            class="select-status-servico"
                                        >

                                            <option
                                                value="andamento"
                                                ${
                                                    servico.statusAtual ===
                                                    "andamento"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                Em Andamento
                                            </option>


                                            <option
                                                value="aguardando"
                                                ${
                                                    servico.statusAtual ===
                                                    "aguardando"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                Aguardando Peça/Aprovação
                                            </option>


                                            <option
                                                value="realizado"
                                                ${
                                                    servico.statusAtual ===
                                                    "realizado"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                Realizado
                                            </option>


                                            <option
                                                value="cancelado"
                                                ${
                                                    servico.statusAtual ===
                                                    "cancelado"
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                Cancelado
                                            </option>

                                        </select>


                                        <input
                                            type="date"
                                            id="input-data-${servico.id}"
                                            class="input-data-servico"
                                        >


                                        <button
                                            type="button"
                                            class="btn-atualizar-status"
                                            id="btn-status-${servico.id}"

                                            onclick="
                                                event.stopPropagation();

                                                mudarStatusServico(
                                                    '${empresa.id}',
                                                    '${servico.id}'
                                                );
                                            "
                                        >

                                            <i class="fa-solid fa-floppy-disk"></i>

                                            Salvar status

                                        </button>

                                    </div>
                                `;
                            }


                            // =========================================
                            // LOCALIZAÇÃO NO MAPA
                            // =========================================

                            const base =
                                obterBaseDoServico(
                                    servico
                                );


                            const localId =
                                base?.id ??
                                servico.localId ??
                                "";


                            // =========================================
                            // CARD
                            // =========================================

                            return `
                                <div
                                    class="
                                        servico-item
                                        ${escapeHtml(
                                            servico.statusAtual || ""
                                        )}
                                        prioridade-${escapeHtml(
                                            prioridade
                                        )}
                                    "

                                    onclick="
                                        focarNoMapa(
                                            '${escapeHtml(localId)}'
                                        )
                                    "
                                >

                                    <div class="servico-topo">

                                        <div>

                                            <div class="servico-local">
                                                ${escapeHtml(
                                                    servico.local ||
                                                    "Local não informado"
                                                )}
                                            </div>


                                            <div class="numero-chamado">

                                                Chamado:
                                                #${escapeHtml(
                                                    servico.chamado ||
                                                    "-"
                                                )}

                                            </div>

                                        </div>


                                        <span
                                            class="
                                                prioridade-badge
                                                prioridade-${escapeHtml(
                                                    prioridade
                                                )}
                                            "
                                        >

                                            ${escapeHtml(
                                                labelPrioridade
                                            )}

                                        </span>

                                    </div>


                                    <div class="servico-desc">

                                        ${escapeHtml(
                                            servico.desc ||
                                            "Sem descrição."
                                        )}

                                    </div>


                                    ${htmlSLA}

                                    ${htmlPrazo}


                                    ${
                                        htmlHistorico

                                            ? `
                                                <div class="historico-box">

                                                    <div class="historico-titulo">

                                                        <i class="fa-solid fa-clock-rotate-left"></i>

                                                        Histórico

                                                    </div>

                                                    ${htmlHistorico}

                                                </div>
                                            `

                                            : ""
                                    }


                                    <div class="servico-status-row">

                                        <span
                                            class="
                                                badge-status
                                                ${escapeHtml(
                                                    servico.statusAtual ||
                                                    ""
                                                )}
                                            "
                                        >

                                            ${escapeHtml(
                                                labelStatusAtual
                                            )}

                                        </span>

                                    </div>


                                    ${htmlMudarStatus}


                                    <div
                                        class="servico-acoes"

                                        onclick="
                                            event.stopPropagation()
                                        "
                                    >

                                        ${htmlEvidencia}


                                        <button
                                            type="button"

                                            class="
                                                btn-servico
                                                btn-excluir
                                            "

                                            onclick="
                                                event.stopPropagation();

                                                deletarServico(
                                                    '${empresa.id}',
                                                    '${servico.id}'
                                                );
                                            "
                                        >

                                            <i class="fa-solid fa-trash-can"></i>

                                            Excluir

                                        </button>

                                    </div>

                                </div>
                            `;
                        }
                    )
                    .join("");


            // ========================================================
            // EMPRESA SEM CHAMADOS
            // ========================================================

            if (servicos.length === 0) {

                htmlServicos = `
                    <div class="sem-servicos">

                        <i class="fa-regular fa-folder-open"></i>

                        <span>
                            Nenhum chamado registrado.
                        </span>

                    </div>
                `;
            }


            // ========================================================
            // CONTADOR
            // ========================================================

            const ativos =
                todosServicos.filter(
                    chamadoEstaAtivo
                ).length;


            // ========================================================
            // CARD DA EMPRESA
            // ========================================================

            htmlCards += `
                <div class="terceirizado-card">

                    <div
                        class="terceirizado-header"

                        id="header-${empresa.id}"

                        onclick="
                            toggleTerceirizado(
                                '${empresa.id}'
                            )
                        "
                    >

                        <div class="empresa-info">

                            <div>

                                <span>
                                    ${escapeHtml(
                                        empresa.nome
                                    )}
                                </span>


                                <div class="empresa-contador">

                                    ${todosServicos.length}
                                    chamado(s)

                                    ${
                                        ativos > 0
                                            ? ` • ${ativos} ativo(s)`
                                            : ""
                                    }

                                </div>

                            </div>

                        </div>


                        <a
                            href="https://wa.me/${encodeURIComponent(
                                empresa.telefone || ""
                            )}"

                            target="_blank"

                            rel="noopener noreferrer"

                            class="btn-whatsapp"

                            onclick="
                                event.stopPropagation()
                            "
                        >

                            <i class="fa-brands fa-whatsapp"></i>

                            WhatsApp

                        </a>

                    </div>


                    <div
                        class="terceirizado-body"

                        id="body-${empresa.id}"
                    >

                        ${htmlServicos}

                    </div>

                </div>
            `;
        }
    );


    // ================================================================
    // INSERIR NA BARRA LATERAL
    // ================================================================

    listaTerceirizados.innerHTML =
        htmlCards;
};
// =====================================================================
// 27. FILTROS DO MAPA
// =====================================================================

window.aplicarFiltros =
function () {

    // ================================================================
    // FILTRO DE STATUS
    // ================================================================

    const filtroStatus =
        document.getElementById(
            "filtro-status"
        )?.value ??
        "todos";


    // ================================================================
    // FILTRO DE TIPO
    // ================================================================

    const filtroTipo =
        document.getElementById(
            "filtro-tipo"
        )?.value ??
        "todos";


    // ================================================================
    // PERCORRER TODOS OS IMÓVEIS
    // ================================================================

    todasBasesFisicas.forEach(

        base => {

            const marker =
                window.marcadoresGlobais[
                    base.id
                ];


            if (!marker) {
                return;
            }


            // ========================================================
            // CATEGORIAS DO IMÓVEL
            // ========================================================

            const categorias =
                Array.isArray(
                    base.categorias
                )
                    ? base.categorias
                    : [];


            // ========================================================
            // FILTRO POR TIPO
            // ========================================================

            let mostrarPorTipo =
                true;


            if (
                filtroTipo !==
                "todos"
            ) {

                mostrarPorTipo =
                    categorias.includes(
                        filtroTipo
                    );

            }


            // ========================================================
            // FILTRO POR STATUS
            // ========================================================

            let mostrarPorStatus =
                true;


            if (
                filtroStatus !==
                "todos"
            ) {

                // ----------------------------------------------------
                // Status padrão
                // ----------------------------------------------------

                let statusBase =
                    "nenhum";


                // ----------------------------------------------------
                // Serviços vinculados ao imóvel
                // ----------------------------------------------------

                const servicosDoLocal =

                    dadosTerceirizados.flatMap(

                        empresa =>

                            (
                                empresa.servicos ??
                                []
                            ).filter(

                                servico =>

                                    servico.localId ===
                                        base.id ||

                                    servico.local ===
                                        base.nome

                            )

                    );


                // ----------------------------------------------------
                // Verificar atrasados
                // ----------------------------------------------------

                const temAtrasado =

                    servicosDoLocal.some(

                        chamadoEstaAtrasado

                    );


                // ----------------------------------------------------
                // Verificar em andamento
                // ----------------------------------------------------

                const temAndamento =

                    servicosDoLocal.some(

                        servico =>

                            servico.statusAtual ===
                            "andamento"

                    );


                // ----------------------------------------------------
                // Verificar aguardando
                // ----------------------------------------------------

                const temAguardando =

                    servicosDoLocal.some(

                        servico =>

                            servico.statusAtual ===
                            "aguardando"

                    );


                // ----------------------------------------------------
                // FILTRO ATRASADO
                // ----------------------------------------------------

                if (

                    filtroStatus ===
                    "atrasado"

                ) {

                    mostrarPorStatus =
                        temAtrasado;

                }


                // ----------------------------------------------------
                // DEMAIS STATUS
                // ----------------------------------------------------

                else {

                    if (
                        temAndamento
                    ) {

                        statusBase =
                            "andamento";

                    }

                    else if (
                        temAguardando
                    ) {

                        statusBase =
                            "aguardando";

                    }


                    mostrarPorStatus =

                        filtroStatus ===
                        statusBase;

                }

            }


            // ========================================================
            // RESULTADO FINAL
            // ========================================================

            const deveMostrar =

                mostrarPorTipo &&
                mostrarPorStatus;


            // ========================================================
            // ADICIONAR / REMOVER DO MAPA
            // ========================================================

            if (
                deveMostrar
            ) {

                if (
                    !map.hasLayer(
                        marker
                    )
                ) {

                    marker.addTo(
                        map
                    );

                }

            }

            else {

                if (
                    map.hasLayer(
                        marker
                    )
                ) {

                    map.removeLayer(
                        marker
                    );

                }

            }

        }

    );

};


// =====================================================================
// 28. INICIALIZAÇÃO DO GEOFACILITIES
// =====================================================================

async function inicializarGeoFacilities() {

    try {

        // =============================================================
        // 1. CARREGAR IMÓVEIS DO JSON
        // =============================================================

        await carregarImoveis();


        // =============================================================
        // 2. CARREGAR DADOS DO FIREBASE
        // =============================================================

        await window.carregarDadosDaNuvem();


        // =============================================================
        // 3. CRIAR MARCADORES DOS IMÓVEIS
        // =============================================================

        await criarMarcadoresComDistanciaReal();


        // =============================================================
        // 4. RENDERIZAR CHAMADOS / TERCEIRIZADOS
        // =============================================================

        window.renderizarTerceirizados();


        // =============================================================
        // 5. ATUALIZAR CORES DOS MARCADORES
        // =============================================================

        todasBasesFisicas.forEach(

            base => {

                window.verificarEAtualizarMarcador(

                    base.id,

                    base.nome

                );

            }

        );


        // =============================================================
        // 6. LOG DE CONFIRMAÇÃO
        // =============================================================

        console.log(
            "GeoFacilities iniciado com sucesso."
        );

        console.log(
            "Total de imóveis:",
            todasBasesFisicas.length
        );


    } catch (erro) {

        console.error(
            "Erro ao inicializar o GeoFacilities:",
            erro
        );

    }

}


// =====================================================================
// 29. EVENTOS DA INTERFACE
// =====================================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // =============================================================
        // BOTÃO DAS EMPRESAS / CHAMADOS
        // =============================================================

        const btn =
            document.getElementById(
                "btn-terceirizados"
            );

        const lista =
            document.getElementById(
                "lista-terceirizados"
            );

        if (
            btn &&
            lista
        ) {
            btn.addEventListener(
                "click",
                event => {
                    event.preventDefault();

                    lista.classList.toggle(
                        "mostrar"
                    );

                    btn.classList.toggle(
                        "ativo"
                    );
                }
            );
        }


        // =============================================================
        // FILTRO DE STATUS
        // =============================================================

        const filtroStatus =
            document.getElementById(
                "filtro-status"
            );

        if (
            filtroStatus
        ) {
            filtroStatus.addEventListener(
                "change",
                () => {
                    window.aplicarFiltros();
                }
            );
        }


        // =============================================================
        // FILTRO DE TIPO
        // =============================================================

        const filtroTipo =
            document.getElementById(
                "filtro-tipo"
            );

        if (
            filtroTipo
        ) {
            filtroTipo.addEventListener(
                "change",
                () => {
                    window.aplicarFiltros();
                }
            );
        }


        // =============================================================
        // INICIALIZAR SISTEMA
        // =============================================================
// =============================================================
// BUSCA DE CHAMADOS
// =============================================================

const inputBuscaChamado =
    document.getElementById(
        "busca-chamado"
    );

const btnLimparBusca =
    document.getElementById(
        "limpar-busca-chamado"
    );


if (inputBuscaChamado) {

    inputBuscaChamado.addEventListener(
        "input",
        event => {

            window.filtrarChamados(
                event.target.value
            );

        }
    );

}


if (btnLimparBusca) {

    btnLimparBusca.addEventListener(
        "click",
        () => {

            if (
                inputBuscaChamado
            ) {
                inputBuscaChamado.value =
                    "";
            }

            window.filtrarChamados(
                ""
            );

            inputBuscaChamado?.focus();

        }
    );

}
        inicializarGeoFacilities();
    }
);
// =====================================================================
// CADASTRAR EMPRESA TERCEIRIZADA
// =====================================================================

window.cadastrarTerceirizado =
async function () {

    const nomeInput =
        document.getElementById(
            "nova-empresa-nome"
        );

    const telefoneInput =
        document.getElementById(
            "nova-empresa-telefone"
        );

    const nome =
        nomeInput?.value.trim();

    let telefone =
        telefoneInput?.value
            .replace(/\D/g, "");

    if (!nome) {
        alert(
            "Informe o nome da empresa."
        );

        return;
    }

    if (!telefone) {
        alert(
            "Informe o WhatsApp da empresa."
        );

        return;
    }

    // Se usuário digitar apenas:
    // 79999999999
    // adiciona o código do Brasil.

    if (
        telefone.length === 11
    ) {
        telefone =
            `55${telefone}`;
    }

    const nomeNormalizado =
        nome
            .trim()
            .toLowerCase();

    const empresaExiste =
        dadosTerceirizados.some(
            empresa =>
                String(
                    empresa.nome
                )
                    .trim()
                    .toLowerCase() ===
                nomeNormalizado
        );

    if (
        empresaExiste
    ) {
        alert(
            "Essa empresa já está cadastrada."
        );

        return;
    }

    const novaEmpresa = {

        id:
            `empresa-${Date.now()}-` +
            Math.random()
                .toString(36)
                .slice(2, 6),

        nome:
            nome,

        telefone:
            telefone,

        servicos:
            []
    };

    dadosTerceirizados.push(
        novaEmpresa
    );

    try {

        await window.salvarDadosGlobais();

        window.renderizarTerceirizados();
        window.atualizarSelectsEmpresas();
        nomeInput.value =
            "";

        telefoneInput.value =
            "";

        fecharCadastroTerceirizado();

    } catch (erro) {

        // Remove novamente caso
        // Firebase falhe.

        dadosTerceirizados =
            dadosTerceirizados.filter(
                empresa =>
                    empresa.id !==
                    novaEmpresa.id
            );

        console.error(
            "Erro ao cadastrar empresa:",
            erro
        );

        alert(
            "Não foi possível cadastrar a empresa."
        );
    }
};
window.abrirCadastroTerceirizado =
function () {

    const box =
        document.getElementById(
            "cadastro-terceirizado"
        );

    if (box) {
        box.classList.add(
            "mostrar"
        );
    }
};


window.fecharCadastroTerceirizado =
function () {

    const box =
        document.getElementById(
            "cadastro-terceirizado"
        );

    if (box) {
        box.classList.remove(
            "mostrar"
        );
    }
};

// =====================================================================
// BUSCAR CHAMADO
// =====================================================================

let termoBuscaChamado = "";


window.filtrarChamados =
function (
    termo
) {

    termoBuscaChamado =
        String(
            termo || ""
        )
            .trim()
            .toLowerCase();

    window.renderizarTerceirizados();
};