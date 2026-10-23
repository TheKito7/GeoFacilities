import { CONFIG } from "./config.js";
export function fotosConfiguradas() { return Boolean(CONFIG.imgbb.apiKey.trim()); }
export async function enviarFoto(arquivo) {
  if (!arquivo) return "";
  if (!arquivo.type.startsWith("image/")) throw new Error("Selecione uma imagem válida.");
  if (arquivo.size > 8*1024*1024) throw new Error("A imagem deve ter no máximo 8 MB.");
  if (!CONFIG.imgbb.apiKey.trim()) throw new Error("Configure a chave ImgBB em js/extintores/config.js.");
  const form = new FormData();
  form.append("image",arquivo);
  const resposta = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(CONFIG.imgbb.apiKey)}`,{method:"POST",body:form});
  const json = await resposta.json();
  if (!resposta.ok || !json.success || !json.data?.url) throw new Error("Falha no envio da foto ao ImgBB.");
  return json.data.url;
}
