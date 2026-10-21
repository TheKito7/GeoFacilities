"use strict";

// GeoFacilities - Programação Semanal: acesso por link, sem login, com histórico.
// A collection Firestore abaixo não deve compartilhar regras com os chamados do mapa.
const CHAVE_LOCAL = "geofacilities_programacao_v1";
const COLECAO = "programacoes_atividades";
const el = (id) => document.getElementById(id);

const firebaseConfig = {
  apiKey: "AIzaSyAHocNZt0ihtkTplDjLYWMpOFoOj80ycBs",
  authDomain: "geo-facilities.firebaseapp.com",
  projectId: "geo-facilities",
  storageBucket: "geo-facilities.firebasestorage.app",
  messagingSenderId: "379130334399",
  appId: "1:379130334399:web:3ca7ef35480b7ddb6c8a0a"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const colecao = db.collection(COLECAO);

let atividades = [];
let inicio = segundaFeira(new Date());
let conectado = false;
let ultimaLeituraEmCache = false;

function iso(data) {
  return [data.getFullYear(), String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0")].join("-");
}
function deISO(valor) {
  const [ano, mes, dia] = valor.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}
function segundaFeira(data) {
  const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d;
}
function elemento(tag, classe = "", conteudo = "") {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (conteudo !== "") no.textContent = conteudo;
  return no;
}
function aviso(mensagem, erro = false) {
  const no = el("mensagem");
  no.textContent = mensagem;
  no.classList.toggle("erro", erro);
}
function estadoConexao(mensagem, pronto = false) {
  conectado = pronto;
  el("conexao").textContent = mensagem;
  el("btn-adicionar").disabled = !pronto;
  el("btn-importar").disabled = !pronto;
}
function lerDadosLocais() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_LOCAL) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch { return []; }
}
function criarCampoInformacao(rotulo, valor) {
  const linha = elemento("div", "informacao");
  linha.append(elemento("span", "informacao-rotulo", rotulo),
    elemento("span", "informacao-valor", valor));
  return linha;
}

async function salvarStatus(atividade, status, justificativa = "") {
  const motivo = String(justificativa).trim();
  if (status === "nao-realizada" && !motivo) {
    aviso("Informe o motivo da não realização.", true);
    return;
  }
  try {
    await colecao.doc(atividade.id).update({
      status,
      justificativa: status === "nao-realizada" ? motivo.slice(0, 400) : "",
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    aviso("Status atualizado para todos os aparelhos.");
  } catch (erro) {
    console.error("Falha ao atualizar status:", erro);
    aviso("Não foi possível salvar o status. Confira as regras da coleção no Firestore.", true);
    renderizar();
  }
}

function criarControles(atividade) {
  const controles = elemento("div", "controles");
  const seletor = document.createElement("select");
  seletor.setAttribute("aria-label", `Status da atividade de ${atividade.responsaveis}`);
  for (const [valor, nome] of [
    ["pendente", "Pendente"], ["realizada", "Realizada"], ["nao-realizada", "Não realizada"]
  ]) seletor.add(new Option(nome, valor));
  seletor.value = atividade.status || "pendente";
  seletor.disabled = !conectado;

  const motivo = document.createElement("textarea");
  motivo.maxLength = 400;
  motivo.placeholder = "Motivo da não realização";
  motivo.setAttribute("aria-label", "Motivo da não realização");
  motivo.value = atividade.justificativa || "";
  motivo.hidden = seletor.value !== "nao-realizada";

  const btnMotivo = elemento("button", "salvar-motivo", "Salvar motivo");
  btnMotivo.type = "button";
  btnMotivo.hidden = seletor.value !== "nao-realizada";
  btnMotivo.disabled = !conectado;
  btnMotivo.addEventListener("click", async () => {
    btnMotivo.disabled = true;
    await salvarStatus(atividade, "nao-realizada", motivo.value);
    btnMotivo.disabled = !conectado;
  });
  seletor.addEventListener("change", async () => {
    const valor = seletor.value;
    motivo.hidden = valor !== "nao-realizada";
    btnMotivo.hidden = valor !== "nao-realizada";
    if (valor !== "nao-realizada") {
      seletor.disabled = true;
      await salvarStatus(atividade, valor);
      seletor.disabled = !conectado;
    } else motivo.focus();
  });
  controles.append(seletor, motivo, btnMotivo);

  const excluir = elemento("button", "excluir", "Excluir");
  excluir.type = "button";
  excluir.disabled = !conectado;
  excluir.addEventListener("click", async () => {
    if (!confirm("Excluir esta atividade? A exclusão também removerá o registro da semana anterior, caso seja antigo.")) return;
    try {
      await colecao.doc(atividade.id).delete();
      aviso("Atividade excluída.");
    } catch (erro) {
      console.error(erro);
      aviso("Não foi possível excluir a atividade.", true);
    }
  });
  controles.append(excluir);
  return controles;
}
function criarAtividade(atividade) {
  const bloco = elemento("section", `atividade ${atividade.status || "pendente"}`);
  bloco.append(elemento("h3", "atividade-responsavel",
    String(atividade.responsaveis || "Responsável não informado").toUpperCase()));
  bloco.append(criarCampoInformacao("Local", atividade.local || "Não informado"));
  if (atividade.descricao && atividade.descricao.trim())
    bloco.append(criarCampoInformacao("Atividade", atividade.descricao));
  bloco.append(criarControles(atividade));
  return bloco;
}
function renderizar() {
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 4);
  el("periodo").textContent = `${inicio.toLocaleDateString("pt-BR")} a ${fim.toLocaleDateString("pt-BR")}`;
  const semana = el("semana");
  semana.replaceChildren();
  for (let diaSemana = 0; diaSemana < 5; diaSemana++) {
    const data = new Date(inicio);
    data.setDate(data.getDate() + diaSemana);
    const dataISO = iso(data);
    const coluna = elemento("article", `dia ${diaSemana % 2 === 0 ? "azul" : "laranja"}`);
    const topo = elemento("div", "dia-topo",
      data.toLocaleDateString("pt-BR", { weekday: "long" }));
    const box = elemento("div", "dia-box");
    const numero = elemento("div", "data-box", String(data.getDate()).padStart(2, "0"));
    const listaAtividades = elemento("div", "atividades-dia");
    const itens = atividades.filter((a) => a.data === dataISO);
    if (!itens.length) {
      listaAtividades.append(elemento("p", "dia-vazio",
        conectado ? "Nenhuma atividade programada" : "Carregando programação..."));
    } else itens.forEach((a) => listaAtividades.append(criarAtividade(a)));
    box.append(numero, listaAtividades);
    coluna.append(topo, box);
    semana.append(coluna);
  }
}

// Lista automaticamente as semanas que já possuem atividades no Firestore.
function atualizarHistorico() {
  const seletor = el("historico");
  const valorAtual = iso(inicio);
  const semanas = new Set(atividades
    .filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a.data))
    .map((a) => iso(segundaFeira(deISO(a.data)))));
  semanas.add(valorAtual);
  const opcoes = [...semanas].sort().reverse();
  seletor.replaceChildren(new Option("Ir para uma semana salva...", ""));
  for (const data of opcoes) {
    const segunda = deISO(data);
    const sexta = new Date(segunda); sexta.setDate(sexta.getDate() + 4);
    const titulo = `${segunda.toLocaleDateString("pt-BR")} a ${sexta.toLocaleDateString("pt-BR")}`;
    seletor.add(new Option(titulo, data));
  }
  seletor.value = valorAtual;
}

// Uma assinatura Firestore traz a programação e o histórico juntos.
// Adequada para uma equipe pequena; em volumes grandes pode ser paginada por período.
colecao.onSnapshot({ includeMetadataChanges: true }, (snapshot) => {
  atividades = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    .sort((a, b) => String(a.data).localeCompare(String(b.data)) ||
      String(a.responsaveis).localeCompare(String(b.responsaveis), "pt-BR"));
  ultimaLeituraEmCache = snapshot.metadata.fromCache;
  estadoConexao(ultimaLeituraEmCache ? "Cache local · aguardando nuvem" : "Sincronizado com Firebase", !ultimaLeituraEmCache);
  atualizarHistorico();
  renderizar();
  el("btn-importar").hidden = !lerDadosLocais().length;
}, (erro) => {
  console.error("Falha ao carregar atividades:", erro);
  estadoConexao("Falha ao conectar ao Firestore", false);
  aviso("Verifique as regras de leitura da coleção no Firebase Console.", true);
  renderizar();
});

el("form").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!conectado) return;
  const data = el("data").value;
  const responsaveis = el("responsaveis").value.trim();
  const local = el("local").value.trim();
  const descricao = el("descricao").value.trim();
  if (!data || !responsaveis || !local) return;
  const btn = el("btn-adicionar");
  btn.disabled = true;
  try {
    await colecao.add({
      data, responsaveis, local, descricao, status: "pendente", justificativa: "",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    inicio = segundaFeira(deISO(data));
    el("form").reset();
    el("data").value = iso(new Date());
    atualizarHistorico();
    renderizar();
    aviso("Atividade salva no Firebase e disponível no link compartilhado.");
  } catch (erro) {
    console.error("Falha ao cadastrar:", erro);
    aviso("Não foi possível cadastrar. Confira as regras da coleção no Firestore.", true);
  } finally { btn.disabled = !conectado; }
});

el("anterior").addEventListener("click", () => { inicio.setDate(inicio.getDate() - 7); atualizarHistorico(); renderizar(); });
el("proxima").addEventListener("click", () => { inicio.setDate(inicio.getDate() + 7); atualizarHistorico(); renderizar(); });
el("atual").addEventListener("click", () => { inicio = segundaFeira(new Date()); atualizarHistorico(); renderizar(); });
el("historico").addEventListener("change", () => {
  const valor = el("historico").value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) { inicio = deISO(valor); atualizarHistorico(); renderizar(); }
});

el("btn-compartilhar").addEventListener("click", async () => {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  try {
    await navigator.clipboard.writeText(url.href);
    aviso("Link copiado para compartilhar com a equipe.");
  } catch {
    window.prompt("Copie o link:", url.href);
  }
});

el("btn-importar").addEventListener("click", async () => {
  const locais = lerDadosLocais();
  if (!locais.length || !conectado) return;
  if (!confirm(`Importar ${locais.length} atividade(s) salvas neste navegador? Os dados locais não serão apagados.`)) return;
  const btn = el("btn-importar");
  btn.disabled = true;
  aviso("Importando atividades antigas...");
  let importadas = 0;
  try {
    for (const a of locais) {
      if (!a || !/^\d{4}-\d{2}-\d{2}$/.test(a.data) || !a.responsaveis || !a.local) continue;
      const identificador = typeof a.id === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(a.id)
        ? a.id : null;
      const ref = identificador ? colecao.doc(identificador) : colecao.doc();
      if ((await ref.get()).exists) continue;
      await ref.set({
        data: String(a.data),
        responsaveis: String(a.responsaveis).slice(0, 150),
        local: String(a.local).slice(0, 150),
        descricao: String(a.descricao || "").slice(0, 300),
        status: ["pendente", "realizada", "nao-realizada"].includes(a.status) ? a.status : "pendente",
        justificativa: String(a.justificativa || "").slice(0, 400),
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
      importadas++;
    }
    aviso(`${importadas} atividade(s) importada(s). As semanas anteriores estão disponíveis no Histórico.`);
  } catch (erro) {
    console.error("Falha na importação:", erro);
    aviso("Importação incompleta. Verifique as regras no Firestore.", true);
  } finally { btn.disabled = !conectado; }
});

el("data").value = iso(new Date());
estadoConexao("Conectando ao Firebase...", false);
renderizar();

// ============================================================================
// EXPORTAÇÃO PNG - PLANEJAMENTO SEMANAL (SEM BIBLIOTECAS EXTERNAS)
// Gera uma arte independente do formulário, status e botões da página.
// ============================================================================

function textoEmLinhas(ctx, valor, larguraMaxima) {
  const paragrafos = String(valor || "").split(/\n/);
  const linhas = [];
  paragrafos.forEach((paragrafo) => {
    const palavras = paragrafo.trim().split(/\s+/).filter(Boolean);
    if (!palavras.length) {
      linhas.push("");
      return;
    }
    let linha = "";
    for (const palavra of palavras) {
      const tentativa = linha ? linha + " " + palavra : palavra;
      if (ctx.measureText(tentativa).width <= larguraMaxima) {
        linha = tentativa;
        continue;
      }
      if (linha) linhas.push(linha);
      linha = "";
      // Permite acomodar palavras muito compridas sem cortar o texto.
      for (const caractere of palavra) {
        if (linha && ctx.measureText(linha + caractere).width > larguraMaxima) {
          linhas.push(linha);
          linha = caractere;
        } else {
          linha += caractere;
        }
      }
    }
    if (linha) linhas.push(linha);
  });
  return linhas;
}

function retanguloArredondado(ctx, x, y, w, h, raio, preenchimento, borda, espessura = 2) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, raio);
  } else {
    const r = Math.min(raio, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  if (preenchimento) {
    ctx.fillStyle = preenchimento;
    ctx.fill();
  }
  if (borda) {
    ctx.lineWidth = espessura;
    ctx.strokeStyle = borda;
    ctx.stroke();
  }
}

function desenharLinhas(ctx, linhas, x, y, alturaLinha) {
  linhas.forEach((linha, indice) => ctx.fillText(linha, x, y + indice * alturaLinha));
}

function prepararItensDoDia(ctx, itens) {
  const larguraTexto = 640;
  return itens.map((item) => {
    ctx.font = "900 36px Arial, sans-serif";
    const responsaveis = textoEmLinhas(ctx, String(item.responsaveis || "Responsável").toUpperCase(), 665);
    ctx.font = "26px Arial, sans-serif";
    const locais = textoEmLinhas(ctx, item.local || "Não informado", larguraTexto);
    const descricoes = item.descricao && item.descricao.trim()
      ? textoEmLinhas(ctx, item.descricao, larguraTexto)
      : [];
    const altura = 24 + responsaveis.length * 43 + 10 + locais.length * 34 +
      (descricoes.length ? 8 + descricoes.length * 34 : 0) + 25;
    return { responsaveis, locais, descricoes, altura };
  });
}

function exportarPlanejamentoPNG() {
  const botao = el("exportar-png");
  if (!botao) return;
  botao.disabled = true;
  const textoOriginal = botao.textContent;
  botao.textContent = "Gerando imagem...";

  try {
    const largura = 1080;
    const margem = 75;
    const larguraCard = largura - margem * 2;
    const dataInicio = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const dias = [];

    // Canvas temporário para medir corretamente quebras de linha e alturas.
    const medicao = document.createElement("canvas").getContext("2d");
    for (let i = 0; i < 5; i++) {
      const data = new Date(dataInicio);
      data.setDate(data.getDate() + i);
      const itens = atividades.filter((atividade) => atividade.data === iso(data));
      const blocos = prepararItensDoDia(medicao, itens);
      const alturaConteudo = blocos.length
        ? blocos.reduce((total, bloco) => total + bloco.altura, 0) + (blocos.length - 1) * 2
        : 112;
      dias.push({ data, blocos, altura: Math.max(148, alturaConteudo + 18), cor: i % 2 === 0 ? "#66b4d1" : "#fb8730" });
    }

    const topo = 330;
    const espaco = 39;
    const rodape = 112;
    const alturaTotal = topo + dias.reduce((total, dia) => total + dia.altura, 0) + 23 * 5 + espaco * 4 + rodape;
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = alturaTotal;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("O navegador não conseguiu gerar a imagem.");

    ctx.fillStyle = "#f1f1f1";
    ctx.fillRect(0, 0, largura, alturaTotal);

    // Identidade visual do cartaz (inspirada no modelo do planejamento).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, largura, 72);
    ctx.fillStyle = "#0d789c";
    ctx.font = "bold 36px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("ENERGISA", largura - margem, 47);
    ctx.textAlign = "left";
    ctx.fillStyle = "#f5822a";
    ctx.fillRect(0, 68, largura, 5);
    ctx.fillStyle = "#4cbbd4";
    ctx.fillRect(0, 74, largura, 3);

    ctx.fillStyle = "#101010";
    ctx.font = "900 71px Arial, sans-serif";
    ctx.fillText("PLANEJAMENTO", margem, 157);
    ctx.fillText("SEMANAL", margem, 230);
    ctx.strokeStyle = "#292929";
    ctx.lineWidth = 2;
    ctx.strokeRect(margem - 18, 95, larguraCard + 36, 155);

    const fim = new Date(dataInicio);
    fim.setDate(fim.getDate() + 4);
    const meses = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    ctx.fillStyle = "#164b66";
    ctx.font = "bold 31px Arial, sans-serif";
    ctx.fillText("Facilities", margem, 297);
    ctx.fillStyle = "#101010";
    ctx.font = "italic bold 29px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${meses[dataInicio.getMonth()]} / ${dataInicio.getFullYear()}`, largura - margem, 297);
    ctx.textAlign = "left";

    let y = topo;
    dias.forEach((dia, indice) => {
      const x = margem;
      const corpoY = y + 23;
      const corpoH = dia.altura;
      const numeroW = 124;
      const corAba = indice % 2 === 0 ? "#6dc9e8" : "#ff9848";
      const diaNome = dia.data.toLocaleDateString("pt-BR", { weekday: "long" });

      // Base do cartão e etiqueta superior.
      retanguloArredondado(ctx, x, corpoY, larguraCard, corpoH, 17, dia.cor, "#141414", 3);
      ctx.font = "bold 28px Arial, sans-serif";
      const larguraAba = Math.max(230, ctx.measureText(diaNome).width + 50);
      retanguloArredondado(ctx, x + 7, y, larguraAba, 42, 23, corAba, "#141414", 3);
      ctx.fillStyle = "#101010";
      ctx.fillText(diaNome, x + 28, y + 29);

      // Separador pontilhado e dia da semana (somente uma vez).
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 6]);
      ctx.moveTo(x + numeroW, corpoY + 4);
      ctx.lineTo(x + numeroW, corpoY + corpoH - 4);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#101010";
      ctx.font = "900 74px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(dia.data.getDate()).padStart(2, "0"), x + numeroW / 2, corpoY + corpoH / 2 + 25);
      ctx.textAlign = "left";

      let posY = corpoY + 12;
      const conteudoX = x + numeroW + 27;
      if (!dia.blocos.length) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.font = "bold 29px Arial, sans-serif";
        ctx.fillText("Sem atividades programadas", conteudoX, corpoY + 79);
      } else {
        dia.blocos.forEach((bloco, index) => {
          if (index) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(0,0,0,0.30)";
            ctx.lineWidth = 2;
            ctx.moveTo(conteudoX, posY);
            ctx.lineTo(x + larguraCard - 20, posY);
            ctx.stroke();
            posY += 10;
          }
          posY += 14;
          ctx.fillStyle = "#101010";
          ctx.font = "900 36px Arial, sans-serif";
          desenharLinhas(ctx, bloco.responsaveis, conteudoX, posY + 32, 43);
          posY += bloco.responsaveis.length * 43 + 12;

          ctx.fillStyle = "#23404a";
          ctx.font = "bold 21px Arial, sans-serif";
          ctx.fillText("LOCAL", conteudoX, posY + 24);
          ctx.fillStyle = "#101010";
          ctx.font = "26px Arial, sans-serif";
          desenharLinhas(ctx, bloco.locais, conteudoX + 160, posY + 25, 34);
          posY += bloco.locais.length * 34;

          if (bloco.descricoes.length) {
            posY += 8;
            ctx.fillStyle = "#23404a";
            ctx.font = "bold 21px Arial, sans-serif";
            ctx.fillText("ATIVIDADE", conteudoX, posY + 24);
            ctx.fillStyle = "#101010";
            ctx.font = "26px Arial, sans-serif";
            desenharLinhas(ctx, bloco.descricoes, conteudoX + 160, posY + 25, 34);
            posY += bloco.descricoes.length * 34;
          }
          posY += 27;
        });
      }
      y += 23 + dia.altura + espaco;
    });

    ctx.fillStyle = "#4e5f68";
    ctx.font = "22px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Programação semanal • ${dataInicio.toLocaleDateString("pt-BR")} a ${fim.toLocaleDateString("pt-BR")}`,
      largura / 2,
      alturaTotal - 32
    );
    ctx.textAlign = "left";

    const nomeArquivo = `planejamento-semanal-${iso(dataInicio)}.png`;
    canvas.toBlob((blob) => {
      botao.disabled = false;
      botao.textContent = textoOriginal;
      if (!blob) {
        alert("Não foi possível converter o planejamento para PNG.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      document.body.append(link);
      link.click();
      link.remove();
      // Mantém o endereço temporário válido até o navegador iniciar o download.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, "image/png");
  } catch (erro) {
    console.error("Falha na exportação PNG:", erro);
    alert("Erro ao exportar imagem. Abra o console para verificar os detalhes.");
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

el("exportar-png").addEventListener("click", exportarPlanejamentoPNG);
