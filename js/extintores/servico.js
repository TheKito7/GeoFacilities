import { CONFIG } from "./config.js";
if (!window.firebase) throw new Error("Firebase SDK não carregado");
const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CONFIG.firebase);
export const db = app.firestore();
const extintores = db.collection("extintores");
export async function listarExtintores() {
  const snap = await extintores.get();
  return snap.docs.map(d => ({id:d.id,...d.data()})).sort((a,b)=>String(a.local).localeCompare(String(b.local),"pt-BR"));
}
export async function criarExtintor(dados) {
  const ref = extintores.doc();
  const codigo = `EXT-${ref.id.slice(0,8).toUpperCase()}`;
  await ref.set({...dados,codigo,criadoEm:firebase.firestore.FieldValue.serverTimestamp()});
  return {id:ref.id,codigo,...dados};
}
export async function atualizarExtintor(id,dados) {
  await extintores.doc(id).update(dados);
}
export async function salvarInspecao(id, dados) {
  const ref = extintores.doc(id).collection("inspecoes").doc();
  await ref.set({...dados,criadoEm:firebase.firestore.FieldValue.serverTimestamp(),emailStatus:"pendente"});
  return ref;
}
export async function definirStatusEmail(id,inspecaoId,status) {
  await extintores.doc(id).collection("inspecoes").doc(inspecaoId).update({emailStatus:status});
}
export async function listarInspecoes(id) {
  const snap = await extintores.doc(id).collection("inspecoes").orderBy("criadoEm","desc").get();
  return snap.docs.map(d => ({id:d.id,...d.data()}));
}
