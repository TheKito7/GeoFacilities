// =====================================================================
// GEO FACILITIES 3.0
// EMAILJS
// =====================================================================

const EMAILJS_PUBLIC_KEY = "Tz2VsrXhmLp6_GDRf";
const EMAILJS_SERVICE_ID = "service_qksi7ga";
const EMAILJS_TEMPLATE_ID = "template_l01c4ug";


// =====================================================================
// INICIALIZAÇÃO
// =====================================================================

(function inicializarEmailJS() {

    if (
        typeof emailjs === "undefined"
    ) {

        console.error(
            "EmailJS não foi carregado."
        );

        return;
    }


    try {

        emailjs.init({
            publicKey:
                EMAILJS_PUBLIC_KEY
        });


        console.log(
            "EmailJS inicializado com sucesso."
        );

    } catch (erro) {

        console.error(
            "Erro ao inicializar EmailJS:",
            erro
        );

    }

})();


// =====================================================================
// ENVIAR E-MAIL DE CHAMADO REALIZADO
// =====================================================================

window.enviarEmailChamadoRealizado = async function (
    empresa,
    servico
) {

    try {

        if (
            typeof emailjs === "undefined"
        ) {

            console.error(
                "EmailJS não está disponível."
            );

            return false;
        }


        if (!empresa) {

            console.error(
                "Empresa não informada para envio do e-mail."
            );

            return false;
        }


        if (!servico) {

            console.error(
                "Chamado não informado para envio do e-mail."
            );

            return false;
        }


        // ================================================================
        // DADOS DO CHAMADO
        // ================================================================

        const numeroChamado =
            servico.chamado ||
            servico.numero ||
            servico.id ||
            "Não informado";


        const local =
            servico.local ||
            "Não informado";


        const descricao =
            servico.desc ||
            servico.descricao ||
            "Não informada";


        const empresaNome =
            empresa.nome ||
            "Não informada";


        const telefone =
            empresa.telefone ||
            "Não informado";


        const dataConclusao =
            servico.dataConclusao ||
            servico.dataRealizado ||
            new Date().toLocaleString(
                "pt-BR"
            );


        // ================================================================
        // PARÂMETROS DO TEMPLATE
        // ================================================================

        const templateParams = {

            // Chamado
            chamado:
                numeroChamado,

            numero_chamado:
                numeroChamado,

            // Empresa
            empresa:
                empresaNome,

            empresa_nome:
                empresaNome,

            // Local
            local:
                local,

            // Descrição
            descricao:
                descricao,

            desc:
                descricao,

            // Telefone
            telefone:
                telefone,

            // Data
            data:
                dataConclusao,

            data_conclusao:
                dataConclusao,

            // Status
            status:
                "Realizado"

        };


        console.log(
            "Enviando e-mail pelo EmailJS...",
            templateParams
        );


        // ================================================================
        // ENVIO
        // ================================================================

        const resposta =
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams
            );


        console.log(
            "E-mail enviado com sucesso:",
            resposta
        );


        return true;


    } catch (erro) {

        console.error(
            "Erro ao enviar e-mail:",
            erro
        );


        return false;

    }

};


// =====================================================================
// TESTE MANUAL
// =====================================================================

window.testarEmailJS = async function () {

    console.log(
        "Iniciando teste do EmailJS..."
    );


    const empresaTeste = {

        nome:
            "Empresa Teste",

        telefone:
            "(79) 99999-9999"

    };


    const servicoTeste = {

        chamado:
            "TESTE-001",

        local:
            "Sede Energisa",

        desc:
            "Teste automático de envio de e-mail",

        statusAtual:
            "realizado"

    };


    const resultado =
        await window.enviarEmailChamadoRealizado(
            empresaTeste,
            servicoTeste
        );


    console.log(
        "Resultado do teste:",
        resultado
    );


    return resultado;

};


console.log(
    "Módulo Email carregado - GeoFacilities 3.0"
);