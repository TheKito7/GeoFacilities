// Módulo isolado do painel de indicadores.
import { listarExtintores, listarInspecoes } from "./servico.js";

const el = (id) => document.getElementById(id);
const set = (id, value) => { const node = el(id); if (node) node.textContent = String(value); };

export async function atualizarPainel() {
  if (!el("total-extintores")) return;
  const hoje = new Date();
  const mes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  set("indicadores-mes", hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
  set("indicadores-nota", "Atualizando dados do Firebase...");
  try {
    const equipamentos = await listarExtintores();
    const listas = await Promise.all(equipamentos.map(e => listarInspecoes(e.id)));
    let inspecionados = 0;
    let irregulares = 0;

    // Conta cada extintor uma vez, mesmo que tenha várias inspeções no mês.
    // O resultado utilizado é o da última inspeção daquele mês.
    listas.forEach(registros => {
      const doMes = registros.filter(r => typeof r.data === "string" && r.data.startsWith(mes));
      if (!doMes.length) return;
      inspecionados++;
      doMes.sort((a, b) => {
        const t = item => item.criadoEm?.toMillis?.() ?? 0;
        return t(b) - t(a) || String(b.data).localeCompare(String(a.data));
      });
      if (doMes[0].resultado === "Com irregularidades") irregulares++;
    });

    set("total-extintores", equipamentos.length);
    set("inspecionados-mes", inspecionados);
    set("irregulares-mes", irregulares);
    set("pendentes-mes", equipamentos.length - inspecionados);
    set("indicadores-nota", "Indicadores referentes ao mês atual. Histórico anterior permanece armazenado.");
  } catch (error) {
    console.error("Erro no painel de extintores:", error);
    set("indicadores-nota", "Não foi possível atualizar os indicadores. Confira a conexão com o Firebase.");
  }
}
