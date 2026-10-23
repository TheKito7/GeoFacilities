import { CONFIG } from "./config.js";
export function emailConfigurado() {
  const {publicKey,serviceId,templateId,destinatario}=CONFIG.emailjs;
  return Boolean(publicKey&&serviceId&&templateId&&destinatario);
}
export async function notificarInspecao(extintor,inspecao) {
  if (!emailConfigurado()) return "nao_configurado";
  if (!window.emailjs) throw new Error("Biblioteca EmailJS não carregada.");
  const e=CONFIG.emailjs;
  const itens=Object.entries(inspecao.checklist)
    .map(([nome,valor])=>`${nome}: ${valor}`).join("\n");
  await emailjs.send(e.serviceId,e.templateId,{
    to_email:e.destinatario,
    codigo_extintor:extintor.codigo,
    tipo_extintor:`${extintor.tipo} ${extintor.capacidade}`,
    local:extintor.local,
    data_inspecao:inspecao.data,
    resultado:inspecao.resultado,
    observacoes:inspecao.observacoes||"Sem observações",
    checklist:itens,
    foto_url:inspecao.fotoUrl||"Sem foto",
    // Use {{foto_url}} em link ou conteúdo do template EmailJS.
  },{publicKey:e.publicKey});
  return "enviado";
}
