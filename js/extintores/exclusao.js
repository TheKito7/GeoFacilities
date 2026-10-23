// Exclusão isolada: remove somente um registro de inspeção do Firestore.
import { db } from "./servico.js";
export async function excluirInspecao(extintorId, inspecaoId) {
  if (!extintorId || !inspecaoId) throw new Error("Inspeção ou extintor inválido.");
  await db.collection("extintores").doc(extintorId)
    .collection("inspecoes").doc(inspecaoId).delete();
}
