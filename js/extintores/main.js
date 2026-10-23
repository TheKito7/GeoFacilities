import { excluirInspecao } from "./exclusao.js";
import { atualizarPainel } from "./painel.js";
import {listarExtintores, criarExtintor, atualizarExtintor, salvarInspecao, listarInspecoes, definirStatusEmail} from "./servico.js";
import {enviarFoto, fotosConfiguradas} from "./fotos.js";
import {notificarInspecao, emailConfigurado} from "./email.js";
const $=id=>document.getElementById(id);
const campos=["Acesso livre","Visibilidade","Sinalização","Local correto","Lacre","Pino de segurança","Mangueira e bico","Manômetro"];
const nomes={"Acesso livre":"Acesso livre","Visibilidade":"Visibilidade","Sinalização":"Sinalização","Local correto":"Local correto","Lacre":"Lacre","Pino de segurança":"Pino de segurança","Mangueira e bico":"Mangueira e bico","Manômetro":"Manômetro"};
let urlPrevia = null;
function integracoesStatus() {
  for (const [id, ativo, nome] of [
    ["status-fotos", fotosConfiguradas(), "ImgBB"],
    ["status-email", emailConfigurado(), "EmailJS"]
  ]) {
    const item = $(id);
    if (!item) continue;
    item.textContent = `${nome}: ${ativo ? "configurado" : "não configurado"}`;
    item.classList.toggle("ativo", ativo);
    item.classList.toggle("inativo", !ativo);
  }
}
function limparPrevia() {
  if (urlPrevia) URL.revokeObjectURL(urlPrevia);
  urlPrevia = null;
  $("foto-preview-imagem").removeAttribute("src");
  $("foto-previa").hidden = true;
}
function configurarPrevia() {
  $("foto").addEventListener("change", () => {
    limparPrevia();
    const arquivo = $("foto").files[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) {
      aviso("Selecione um arquivo de imagem.", true);
      $("foto").value = "";
      return;
    }
    urlPrevia = URL.createObjectURL(arquivo);
    $("foto-preview-imagem").src = urlPrevia;
    $("foto-preview-nome").textContent = `${arquivo.name} — ${(arquivo.size/1024/1024).toFixed(2)} MB`;
    $("foto-previa").hidden = false;
  });
  $("remover-foto").addEventListener("click", () => {
    $("foto").value = "";
    limparPrevia();
  });
}
let equipamentos=[],selecionado=null;
function aviso(s,erro=false){$("mensagem").textContent=s;$("mensagem").classList.toggle("erro",erro)}
function dataHoje(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function montarChecklist(){
  const frag=document.createDocumentFragment();
  campos.forEach((nome,i)=>{
    const div=document.createElement("div");div.className="item-check";
    const l=document.createElement("label");l.htmlFor=`c${i}`;l.textContent=nome;
    const select=document.createElement("select");select.id=`c${i}`;select.required=true;
    [["","Selecione"],["OK","OK"],["Irregular","Irregular"],["N/A","Não se aplica"]].forEach(([v,t])=>select.add(new Option(t,v)));
    div.append(l,select);frag.append(div);
  });
  $("checklist").append(frag);
}
function novo(){limparPrevia();selecionado=null;$("equipamento").value="";$("formulario").reset();$("codigo").value="";carregarHistorico().catch(e=>aviso("Erro ao carregar histórico: "+e.message,true))}
function preencher(e){
  limparPrevia();
  selecionado=e;$("codigo").value=e.codigo||"";$("tipo").value=e.tipo||"";$("capacidade").value=e.capacidade||"";
  $("local").value=e.local||"";$("vencimento").value=e.vencimento||"";
  $("foto").value="";$("observacoes").value="";
  campos.forEach((_,i)=>$(`c${i}`).value="");
}
async function carregar(){
  equipamentos=await listarExtintores();
  const atual=selecionado?.id;
  $("equipamento").replaceChildren(new Option("Novo extintor",""));
  equipamentos.forEach(e=>$("equipamento").add(new Option(`${e.codigo} — ${e.local} (${e.tipo} ${e.capacidade})`,e.id)));
  if(atual&&equipamentos.some(e=>e.id===atual)){$("equipamento").value=atual;selecionado=equipamentos.find(e=>e.id===atual);}
}
function adicionarLinha(pai,tag,conteudo){const el=document.createElement(tag);el.textContent=conteudo;pai.append(el);return el}
async function carregarHistorico(){
  const area=$("historico");
  area.replaceChildren();
  adicionarLinha(area,"p","Carregando inspeções...");
  // Sem seleção: apresenta as inspeções de TODOS os extintores.
  // Com seleção: apresenta apenas as inspeções do equipamento escolhido.
  const alvos=selecionado ? [selecionado] : equipamentos;
  if(!alvos.length){area.replaceChildren();adicionarLinha(area,"p","Nenhum extintor cadastrado ainda.");return}
  const resultados=await Promise.all(alvos.map(async e=>{
    const inspecoes=await listarInspecoes(e.id);
    return inspecoes.map(i=>({...i,equipamento:e}));
  }));
  const lista=resultados.flat().sort((a,b)=>{
    const x=a.criadoEm?.toMillis?.()||Date.parse(a.data||"")||0;
    const y=b.criadoEm?.toMillis?.()||Date.parse(b.data||"")||0;
    return y-x;
  });
  area.replaceChildren();
  if(!lista.length){adicionarLinha(area,"p","Nenhuma inspeção encontrada. Salve uma inspeção e tente atualizar.");return}
  adicionarLinha(area,"p",`${lista.length} inspeção(ões) encontrada(s).`);
  for(const i of lista){
    const card=document.createElement("article");
    card.className="inspecao "+(i.resultado==="Conforme"?"resultado-regular":"resultado-irregular");
    adicionarLinha(card,"h3",`${i.data||"Data não informada"} — ${i.resultado||"Sem resultado"}`);
    adicionarLinha(card,"p",`${i.equipamento.codigo||"Extintor"} • ${i.equipamento.tipo||""} ${i.equipamento.capacidade||""} • ${i.equipamento.local||""}`);
    adicionarLinha(card,"p",`Observações: ${i.observacoes||"Sem observações"}`);
    adicionarLinha(card,"p",`E-mail: ${i.emailStatus||"Não informado"}`);
    if(i.fotoUrl){const link=document.createElement("a");link.href=i.fotoUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Visualizar foto";card.append(link)}
    const detalhes=document.createElement("details");const summary=document.createElement("summary");summary.textContent="Ver checklist";detalhes.append(summary);
    Object.entries(i.checklist||{}).forEach(([nome,valor])=>adicionarLinha(detalhes,"p",`${nome}: ${valor}`));
    card.append(detalhes);
    const botoes = document.createElement("div");
    botoes.className = "acoes-inspecao";
    const botaoExcluir = document.createElement("button");
    botaoExcluir.type = "button";
    botaoExcluir.className = "botao-excluir-inspecao";
    botaoExcluir.textContent = "Apagar inspeção";
    botaoExcluir.setAttribute("aria-label", `Apagar inspeção de ${i.equipamento.codigo || "extintor"} de ${i.data || "data não informada"}`);
    botaoExcluir.addEventListener("click", async () => {
      const descricao = `${i.equipamento.codigo || "Extintor"} — ${i.data || "sem data"}`;
      if (!window.confirm(`Apagar a inspeção ${descricao}? Esta ação é permanente no Firestore.`)) return;
      botaoExcluir.disabled = true;
      try {
        await excluirInspecao(i.equipamento.id, i.id);
        await carregarHistorico();
        await atualizarPainel();
        aviso(`Inspeção ${descricao} apagada do Firestore.`);
      } catch (erro) {
        console.error("Erro ao excluir inspeção:", erro);
        aviso("Não foi possível apagar a inspeção: " + erro.message, true);
        botaoExcluir.disabled = false;
      }
    });
    botoes.append(botaoExcluir);
    card.append(botoes);
    area.append(card);
  }
}
async function salvar(evento){
  evento.preventDefault();$("salvar").disabled=true;
  const tipo=$("tipo").value,capacidade=$("capacidade").value.trim(),local=$("local").value.trim(),vencimento=$("vencimento").value;
  const checklist={};
  for(let i=0;i<campos.length;i++){
    const r=$(`c${i}`).value;
    if(!r){aviso("Preencha todos os itens do checklist.",true);$("salvar").disabled=false;return}
    checklist[nomes[campos[i]]]=r;
  }
  const dados={tipo,capacidade,local,vencimento};
  const inspecao={data:dataHoje(),checklist,resultado:Object.values(checklist).includes("Irregular")?"Com irregularidades":"Conforme",observacoes:$("observacoes").value.trim(),fotoUrl:""};
  try{
    aviso("Preparando o registro da inspeção...");
    if ($("foto").files[0]) aviso("Enviando foto para o ImgBB...");
    // O upload vem antes do registro: se falhar, não cria inspeção incompleta.
    inspecao.fotoUrl=await enviarFoto($("foto").files[0]);
    if(!selecionado){selecionado=await criarExtintor(dados)}
    else await atualizarExtintor(selecionado.id,dados);
    aviso("Gravando inspeção no Firebase...");
    const ref=await salvarInspecao(selecionado.id,inspecao);
    // Atualiza o histórico IMEDIATAMENTE após gravar no Firestore.
    // O envio de e-mail não deve impedir a atualização da tela.
    let erroAtualizacao = false;
    try {
      await carregar();
      $("equipamento").value=selecionado.id;
      preencher(selecionado);
      await carregarHistorico();
      await atualizarPainel();
      aviso("Inspeção registrada no Firebase. Verificando envio de e-mail...");
    } catch (erroConsulta) {
      erroAtualizacao = true;
      console.error("Registro salvo, mas houve falha ao atualizar a tela:",erroConsulta);
      aviso("Inspeção salva, mas o histórico não pôde ser atualizado. Clique em Atualizar.",true);
    }

    try {
      const status=await notificarInspecao(selecionado,inspecao);
      await definirStatusEmail(selecionado.id,ref.id,status);
      if (!erroAtualizacao) {
        aviso(status==="enviado"
          ? "Inspeção salva e e-mail enviado. Histórico atualizado."
          : "Inspeção salva e histórico atualizado. Configure o EmailJS para enviar o e-mail.");
      }
    } catch (erroEmail) {
      console.error("Inspeção salva, mas e-mail falhou:",erroEmail);
      try { await definirStatusEmail(selecionado.id,ref.id,"falhou"); } catch(e) {console.error(e)}
      aviso("Inspeção salva no Firebase, mas o e-mail falhou. Confira o EmailJS.",true);
    }
    // Atualiza o status do e-mail exibido no histórico sem gravar nova inspeção.
    try { await carregarHistorico(); } catch(e) {
      console.error("Falha ao atualizar histórico após notificação:",e);
      aviso("Inspeção salva. Não foi possível recarregar o histórico; use Atualizar.",true);
    }
  }catch(erro){console.error(erro);aviso(erro.message||"Falha ao salvar a inspeção.",true)}
  finally{$("salvar").disabled=false}
}
async function iniciar(){
  montarChecklist();
  configurarPrevia();
  integracoesStatus();
  $("equipamento").addEventListener("change",async e=>{
    const achado=equipamentos.find(x=>x.id===e.target.value);
    if(achado)preencher(achado);else novo();
    try{await carregarHistorico()}catch(erro){aviso("Erro ao carregar histórico: "+erro.message,true)}
  });
  $("novo").addEventListener("click",novo);
  $("atualizar").addEventListener("click",async()=>{try{await carregar();await carregarHistorico();await atualizarPainel();aviso("Dados atualizados.")}catch(e){aviso(e.message,true)}});
  $("formulario").addEventListener("submit",salvar);
  try{await carregar();await carregarHistorico();await atualizarPainel();aviso("Pronto. O histórico geral foi carregado abaixo.")}catch(e){aviso("Não foi possível acessar o Firebase: "+e.message,true)}
}
iniciar();
