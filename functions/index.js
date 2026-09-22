const {
    setGlobalOptions
} = require(
    "firebase-functions/v2"
);

const {
    onDocumentUpdated
} = require(
    "firebase-functions/v2/firestore"
);

const logger =
    require(
        "firebase-functions/logger"
    );


// ================================================================
// CONFIGURAÇÃO GLOBAL
// ================================================================

setGlobalOptions({
    maxInstances: 10
});


// ================================================================
// LOCALIZAR CHAMADO POR ID
// ================================================================

function localizarChamado(
    empresas,
    servicoId
) {

    for (
        const empresa of empresas || []
    ) {

        const servicos =
            Array.isArray(
                empresa.servicos
            )
                ? empresa.servicos
                : [];


        const servico =
            servicos.find(
                item =>
                    item.id === servicoId
            );


        if (servico) {

            return {
                empresa,
                servico
            };
        }
    }


    return null;
}


// ================================================================
// LISTAR TODOS OS CHAMADOS
// ================================================================

function listarChamados(
    empresas
) {

    const resultado = [];


    for (
        const empresa of empresas || []
    ) {

        const servicos =
            Array.isArray(
                empresa.servicos
            )
                ? empresa.servicos
                : [];


        for (
            const servico of servicos
        ) {

            resultado.push({
                empresa,
                servico
            });
        }
    }


    return resultado;
}


// ================================================================
// QUANDO O DOCUMENTO facilities/chamados FOR ALTERADO
// ================================================================

exports.notificarChamadoRealizado =
onDocumentUpdated(
    "facilities/chamados",

    async event => {

        // ============================================================
        // DADOS ANTES E DEPOIS
        // ============================================================

        const dadosAntes =
            event.data.before.data();

        const dadosDepois =
            event.data.after.data();


        const empresasAntes =
            Array.isArray(
                dadosAntes.empresas
            )
                ? dadosAntes.empresas
                : [];


        const empresasDepois =
            Array.isArray(
                dadosDepois.empresas
            )
                ? dadosDepois.empresas
                : [];


        // ============================================================
        // PEGAR TODOS OS CHAMADOS ATUAIS
        // ============================================================

        const chamadosDepois =
            listarChamados(
                empresasDepois
            );


        // ============================================================
        // COMPARAR UM A UM
        // ============================================================

        for (
            const itemDepois of
            chamadosDepois
        ) {

            const servicoDepois =
                itemDepois.servico;


            // Chamado precisa ter ID
            if (
                !servicoDepois.id
            ) {
                continue;
            }


            // ========================================================
            // LOCALIZAR MESMO CHAMADO NO ESTADO ANTERIOR
            // ========================================================

            const encontradoAntes =
                localizarChamado(
                    empresasAntes,
                    servicoDepois.id
                );


            // Se não existia antes, significa que foi criado agora.
            // Não queremos enviar e-mail apenas porque foi criado.
            if (
                !encontradoAntes
            ) {
                continue;
            }


            const servicoAntes =
                encontradoAntes.servico;


            // ========================================================
            // VERIFICAR MUDANÇA PARA REALIZADO
            // ========================================================

            const mudouParaRealizado =
                servicoAntes.statusAtual !==
                    "realizado" &&

                servicoDepois.statusAtual ===
                    "realizado";


            if (
                !mudouParaRealizado
            ) {
                continue;
            }


            // ========================================================
            // CHAMADO CONCLUÍDO ENCONTRADO
            // ========================================================

            logger.info(
                "Chamado concluído detectado",
                {
                    servicoId:
                        servicoDepois.id,

                    chamado:
                        servicoDepois.chamado,

                    empresa:
                        itemDepois.empresa.nome,

                    local:
                        servicoDepois.local,

                    fotoDepois:
                        servicoDepois.fotoDepois ||
                        null
                }
            );


            // ========================================================
            // ENVIO DE E-MAIL SERÁ ADICIONADO NA PRÓXIMA ETAPA
            // ========================================================

            logger.info(
                "Pronto para enviar e-mail ao gestor",
                {
                    chamado:
                        servicoDepois.chamado
                }
            );
        }


        return null;
    }
);