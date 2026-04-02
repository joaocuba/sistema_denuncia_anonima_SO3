const STORAGE_KEY = "denuncias_anonimas_v1";
const COUNTER_KEY = "denuncias_contador_por_ano_v1";

const CATEGORIAS = [
  {
    nome: "Segurança e Violência",
    subcategorias: [
      "Violência contra a mulher",
      "Violência contra crianças",
      "Violência contra idosos",
      "Furto/Roubo",
      "Drogas",
      "Atividade suspeita"
    ]
  },
  {
    nome: "Direitos e Conduta",
    subcategorias: [
      "Assédio moral/sexual",
      "Bullying/Cyberbullying",
      "Discriminação",
      "Direitos humanos",
      "Denúncia institucional"
    ]
  },
  {
    nome: "Meio Ambiente e Bem-Estar",
    subcategorias: [
      "Maus-tratos a animais",
      "Crimes ambientais",
      "Perturbação do sossego",
      "Situações de risco"
    ]
  },
  {
    nome: "Cidade e Serviços",
    subcategorias: [
      "Infraestrutura urbana",
      "Serviços públicos",
      "Transporte e trânsito",
      "Irregularidades escolares"
    ]
  }
];

const FLUXO_STATUS = [
  { nome: "denúncia recebida", classe: "status-recebida", limiteMinutos: 3 },
  { nome: "em análise", classe: "status-analise", limiteMinutos: 15 },
  { nome: "encaminhada", classe: "status-encaminhada", limiteMinutos: 60 },
  { nome: "concluída", classe: "status-concluida", limiteMinutos: Number.POSITIVE_INFINITY }
];

let categoriaAtual = "";
let subcategoriaAtual = "";
let ultimaDenunciaParaPdf = null;

const elementos = {
  denunciaForm: document.getElementById("denunciaForm"),
  consultaForm: document.getElementById("consultaForm"),
  gradeCategorias: document.getElementById("gradeCategorias"),
  subcategoriaArea: document.getElementById("subcategoriaArea"),
  subcategoriasContainer: document.getElementById("subcategoriasContainer"),
  categoriaSelecionada: document.getElementById("categoriaSelecionada"),
  subcategoriaSelecionada: document.getElementById("subcategoriaSelecionada"),
  descricao: document.getElementById("descricao"),
  bairro: document.getElementById("bairro"),
  rua: document.getElementById("rua"),
  referencia: document.getElementById("referencia"),
  anexos: document.getElementById("anexos"),
  listaArquivos: document.getElementById("listaArquivos"),
  feedbackFormulario: document.getElementById("feedbackFormulario"),
  resultadoProtocolo: document.getElementById("resultadoProtocolo"),
  protocoloGerado: document.getElementById("protocoloGerado"),
  btnDownloadPdf: document.getElementById("btnDownloadPdf"),
  protocoloConsulta: document.getElementById("protocoloConsulta"),
  feedbackConsulta: document.getElementById("feedbackConsulta"),
  resultadoConsulta: document.getElementById("resultadoConsulta"),
  consultaProtocolo: document.getElementById("consultaProtocolo"),
  consultaStatus: document.getElementById("consultaStatus"),
  consultaCategoria: document.getElementById("consultaCategoria"),
  consultaLocal: document.getElementById("consultaLocal"),
  consultaCriacao: document.getElementById("consultaCriacao"),
  consultaAtualizacao: document.getElementById("consultaAtualizacao")
};

function iniciarAplicacao() {
  renderizarCategorias();
  renderizarSubcategorias("");
  renderizarListaArquivos([]);

  if (elementos.btnDownloadPdf) {
    elementos.btnDownloadPdf.disabled = true;
    elementos.btnDownloadPdf.addEventListener("click", gerarComprovantePdf);
  }

  elementos.anexos.addEventListener("change", () => {
    const arquivos = Array.from(elementos.anexos.files || []);
    renderizarListaArquivos(arquivos.map((arquivo) => arquivo.name));
  });

  elementos.denunciaForm.addEventListener("submit", (evento) => {
    evento.preventDefault();
    processarEnvioDenuncia();
  });

  elementos.consultaForm.addEventListener("submit", (evento) => {
    evento.preventDefault();
    processarConsulta();
  });
}

function renderizarCategorias() {
  elementos.gradeCategorias.innerHTML = "";

  CATEGORIAS.forEach((grupo) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "categoria-card";
    botao.dataset.categoria = grupo.nome;
    botao.setAttribute("aria-pressed", "false");
    botao.innerHTML = `<h3>${grupo.nome}</h3>`;

    botao.addEventListener("click", () => selecionarCategoria(grupo.nome));
    elementos.gradeCategorias.appendChild(botao);
  });
}

function renderizarSubcategorias(nomeCategoria) {
  elementos.subcategoriasContainer.innerHTML = "";

  if (!nomeCategoria) {
    elementos.subcategoriaArea.classList.add("oculto");
    return;
  }

  const grupo = CATEGORIAS.find((categoria) => categoria.nome === nomeCategoria);
  if (!grupo) {
    elementos.subcategoriaArea.classList.add("oculto");
    return;
  }

  elementos.subcategoriaArea.classList.remove("oculto");

  grupo.subcategorias.forEach((subcategoria) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "chip-subcategoria";
    botao.textContent = subcategoria;
    botao.dataset.subcategoria = subcategoria;

    botao.addEventListener("click", () => selecionarSubcategoria(subcategoria));
    elementos.subcategoriasContainer.appendChild(botao);
  });
}

function selecionarCategoria(nomeCategoria) {
  categoriaAtual = nomeCategoria;
  subcategoriaAtual = "";

  elementos.categoriaSelecionada.value = categoriaAtual;
  elementos.subcategoriaSelecionada.value = "";

  const botoes = elementos.gradeCategorias.querySelectorAll(".categoria-card");
  botoes.forEach((botao) => {
    const ativo = botao.dataset.categoria === nomeCategoria;
    botao.classList.toggle("ativa", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });

  renderizarSubcategorias(nomeCategoria);
}

function selecionarSubcategoria(nomeSubcategoria) {
  subcategoriaAtual = nomeSubcategoria;
  elementos.subcategoriaSelecionada.value = subcategoriaAtual;

  const botoes = elementos.subcategoriasContainer.querySelectorAll(".chip-subcategoria");
  botoes.forEach((botao) => {
    botao.classList.toggle("ativa", botao.dataset.subcategoria === nomeSubcategoria);
  });
}

function renderizarListaArquivos(nomesArquivos) {
  elementos.listaArquivos.innerHTML = "";

  if (!nomesArquivos.length) {
    const item = document.createElement("li");
    item.textContent = "Nenhum anexo selecionado.";
    elementos.listaArquivos.appendChild(item);
    return;
  }

  nomesArquivos.forEach((nomeArquivo) => {
    const item = document.createElement("li");
    item.textContent = nomeArquivo;
    elementos.listaArquivos.appendChild(item);
  });
}

async function processarEnvioDenuncia() {
  esconderFeedback(elementos.feedbackFormulario);
  esconderFeedback(elementos.feedbackConsulta);
  elementos.resultadoConsulta.classList.add("oculto");

  const erros = validarFormulario();
  if (erros.length) {
    mostrarFeedback(
      elementos.feedbackFormulario,
      "erro",
      `Corrija os campos obrigatórios: ${erros.join(" | ")}`
    );
    return;
  }

  const denuncias = obterDenuncias();
  const agora = new Date();
  const protocolo = gerarProtocolo(denuncias, agora);
  const arquivosSelecionados = Array.from(elementos.anexos.files || []);

  const anexosProcessados = await processarAnexosParaPdf(arquivosSelecionados);

  const denuncia = {
    protocolo,
    categoria: categoriaAtual,
    subcategoria: subcategoriaAtual,
    descricao: elementos.descricao.value.trim(),
    localizacao: {
      bairro: elementos.bairro.value.trim(),
      rua: elementos.rua.value.trim(),
      referencia: elementos.referencia.value.trim()
    },
    anexos: anexosProcessados.todosNomes,
    status: "denúncia recebida",
    criadaEm: agora.toISOString(),
    atualizadaEm: agora.toISOString()
  };

  denuncias.push(denuncia);
  salvarDenuncias(denuncias);

  prepararDenunciaParaPdf(denuncia, anexosProcessados);

  mostrarFeedback(
    elementos.feedbackFormulario,
    "sucesso",
    "Denúncia registrada com sucesso. Protocolo e comprovante em PDF disponíveis abaixo."
  );
  exibirProtocoloGerado(protocolo);
  limparFormularioDenuncia();
}

function processarConsulta() {
  esconderFeedback(elementos.feedbackConsulta);

  const protocoloInformado = elementos.protocoloConsulta.value.trim().toUpperCase();
  if (!protocoloInformado) {
    mostrarFeedback(elementos.feedbackConsulta, "erro", "Informe um protocolo para consulta.");
    elementos.resultadoConsulta.classList.add("oculto");
    return;
  }

  const denuncias = obterDenuncias();
  const indiceDenuncia = denuncias.findIndex(
    (item) => item.protocolo.toUpperCase() === protocoloInformado
  );

  if (indiceDenuncia === -1) {
    mostrarFeedback(
      elementos.feedbackConsulta,
      "erro",
      "Protocolo não encontrado neste navegador. Verifique o número informado."
    );
    elementos.resultadoConsulta.classList.add("oculto");
    return;
  }

  const denuncia = denuncias[indiceDenuncia];
  const novoStatus = calcularStatusMockado(denuncia.criadaEm);

  if (denuncia.status !== novoStatus.nome) {
    denuncia.status = novoStatus.nome;
    denuncia.atualizadaEm = new Date().toISOString();
    denuncias[indiceDenuncia] = denuncia;
    salvarDenuncias(denuncias);
  }

  preencherResultadoConsulta(denuncia, novoStatus.classe);
  mostrarFeedback(elementos.feedbackConsulta, "sucesso", "Protocolo localizado com sucesso.");
}

function validarFormulario() {
  const erros = [];

  if (!categoriaAtual) {
    erros.push("selecione uma categoria");
  }

  if (!subcategoriaAtual) {
    erros.push("selecione uma subcategoria");
  }

  if (elementos.descricao.value.trim().length < 20) {
    erros.push("descrição com no mínimo 20 caracteres");
  }

  if (!elementos.bairro.value.trim()) {
    erros.push("bairro");
  }

  if (!elementos.rua.value.trim()) {
    erros.push("rua");
  }

  if (!elementos.referencia.value.trim()) {
    erros.push("ponto de referência");
  }

  return erros;
}

function exibirProtocoloGerado(protocolo) {
  elementos.protocoloGerado.textContent = protocolo;
  elementos.resultadoProtocolo.classList.remove("oculto");
}

function preencherResultadoConsulta(denuncia, classeStatus) {
  elementos.consultaProtocolo.textContent = denuncia.protocolo;
  elementos.consultaStatus.textContent = denuncia.status;
  elementos.consultaStatus.className = `badge-status ${classeStatus}`;
  elementos.consultaCategoria.textContent = `${denuncia.categoria} • ${denuncia.subcategoria}`;
  elementos.consultaLocal.textContent = `${denuncia.localizacao.bairro}, ${denuncia.localizacao.rua} (${denuncia.localizacao.referencia})`;
  elementos.consultaCriacao.textContent = formatarDataHora(denuncia.criadaEm);
  elementos.consultaAtualizacao.textContent = formatarDataHora(denuncia.atualizadaEm);
  elementos.resultadoConsulta.classList.remove("oculto");
}

function limparFormularioDenuncia() {
  elementos.denunciaForm.reset();
  categoriaAtual = "";
  subcategoriaAtual = "";

  elementos.categoriaSelecionada.value = "";
  elementos.subcategoriaSelecionada.value = "";

  elementos.gradeCategorias.querySelectorAll(".categoria-card").forEach((botao) => {
    botao.classList.remove("ativa");
    botao.setAttribute("aria-pressed", "false");
  });

  renderizarSubcategorias("");
  renderizarListaArquivos([]);
}

function mostrarFeedback(elemento, tipo, mensagem) {
  elemento.textContent = mensagem;
  elemento.classList.remove("oculto", "erro", "sucesso");
  elemento.classList.add(tipo);
}

function esconderFeedback(elemento) {
  elemento.textContent = "";
  elemento.classList.remove("erro", "sucesso");
  elemento.classList.add("oculto");
}

function obterDenuncias() {
  const texto = localStorage.getItem(STORAGE_KEY);
  if (!texto) {
    return [];
  }

  try {
    const dados = JSON.parse(texto);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    return [];
  }
}

function salvarDenuncias(denuncias) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(denuncias));
}

function obterContadorPorAno() {
  const texto = localStorage.getItem(COUNTER_KEY);
  if (!texto) {
    return {};
  }

  try {
    const dados = JSON.parse(texto);
    return dados && typeof dados === "object" ? dados : {};
  } catch (erro) {
    return {};
  }
}

function salvarContadorPorAno(contadorPorAno) {
  localStorage.setItem(COUNTER_KEY, JSON.stringify(contadorPorAno));
}

function gerarProtocolo(denuncias, dataBase) {
  const ano = String(dataBase.getFullYear());
  const contadorPorAno = obterContadorPorAno();

  let sequencial = Number(contadorPorAno[ano] || 0);
  let protocolo = "";

  do {
    sequencial += 1;
    protocolo = `DEN-${ano}-${String(sequencial).padStart(6, "0")}`;
  } while (denuncias.some((item) => item.protocolo === protocolo));

  contadorPorAno[ano] = sequencial;
  salvarContadorPorAno(contadorPorAno);
  return protocolo;
}

function calcularStatusMockado(dataCriacaoIso) {
  const criadoEm = new Date(dataCriacaoIso).getTime();
  const agora = Date.now();
  const minutos = Math.max(0, (agora - criadoEm) / 60000);

  const status = FLUXO_STATUS.find((item) => minutos < item.limiteMinutos);
  return status || FLUXO_STATUS[0];
}

function formatarDataHora(dataIso) {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) {
    return "-";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

async function processarAnexosParaPdf(arquivos) {
  const imagens = [];
  const naoImagem = [];
  const todosNomes = arquivos.map((arquivo) => arquivo.name);

  for (const arquivo of arquivos) {
    if (arquivo.type && arquivo.type.startsWith("image/")) {
      try {
        const dataUrl = await lerArquivoComoDataURL(arquivo);
        imagens.push({
          nome: arquivo.name,
          dataUrl
        });
      } catch (erro) {
        naoImagem.push(`${arquivo.name} (imagem não pôde ser lida)`);
      }
    } else {
      naoImagem.push(arquivo.name);
    }
  }

  return {
    imagens,
    naoImagem,
    todosNomes
  };
}

function lerArquivoComoDataURL(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      resolve(String(leitor.result));
    };

    leitor.onerror = () => {
      reject(new Error("Falha ao ler arquivo."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

function prepararDenunciaParaPdf(denuncia, anexosProcessados) {
  ultimaDenunciaParaPdf = {
    ...denuncia,
    imagensPdf: anexosProcessados.imagens,
    anexosNaoImagem: anexosProcessados.naoImagem
  };

  if (elementos.btnDownloadPdf) {
    elementos.btnDownloadPdf.disabled = false;
  }
}

function gerarComprovantePdf() {
  if (!ultimaDenunciaParaPdf) {
    mostrarFeedback(
      elementos.feedbackFormulario,
      "erro",
      "Não há denúncia recente disponível para exportação em PDF."
    );
    return;
  }

  const nomeArquivo = `denuncia-${ultimaDenunciaParaPdf.protocolo}.pdf`;
  const janelaComprovante = window.open("", "_blank", "width=980,height=760");

  if (!janelaComprovante) {
    mostrarFeedback(
      elementos.feedbackFormulario,
      "erro",
      "Seu navegador bloqueou a janela do comprovante. Permita pop-ups para gerar o PDF."
    );
    return;
  }

  const htmlComprovante = montarHtmlComprovante(ultimaDenunciaParaPdf, nomeArquivo);
  janelaComprovante.document.open();
  janelaComprovante.document.write(htmlComprovante);
  janelaComprovante.document.close();
}

function montarHtmlComprovante(denuncia, nomeArquivo) {
  const imagensHtml = denuncia.imagensPdf.length
    ? denuncia.imagensPdf
      .map(
        (imagem, indice) => `
          <figure class="bloco-imagem">
            <img src="${imagem.dataUrl}" alt="Anexo de imagem ${indice + 1}">
            <figcaption>${escaparHtml(imagem.nome)}</figcaption>
          </figure>
        `
      )
      .join("")
    : "<p class=\"vazio\">Nenhuma imagem anexada.</p>";

  const anexosNaoImagemHtml = denuncia.anexosNaoImagem.length
    ? `
      <ul>
        ${denuncia.anexosNaoImagem
          .map((nome) => `<li>${escaparHtml(nome)}</li>`)
          .join("")}
      </ul>
    `
    : "<p class=\"vazio\">Nenhum anexo de vídeo/documento.</p>";

  const statusAtual = calcularStatusMockado(denuncia.criadaEm).nome;
  const localizacao = `${denuncia.localizacao.bairro}, ${denuncia.localizacao.rua}, ${denuncia.localizacao.referencia}`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escaparHtml(nomeArquivo)}</title>
      <style>
        :root {
          --azul: #1a3d59;
          --borda: #c7d4df;
          --fundo: #f4f7fa;
          --texto: #1e2e3d;
          --sec: #4f6275;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 24px;
          font-family: "Segoe UI", Tahoma, sans-serif;
          color: var(--texto);
          background: var(--fundo);
          line-height: 1.45;
        }
        .comprovante {
          max-width: 860px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid var(--borda);
          border-radius: 12px;
          padding: 24px;
        }
        h1 {
          margin: 0 0 4px;
          font-size: 24px;
          color: var(--azul);
        }
        .sub {
          margin: 0 0 14px;
          color: var(--sec);
          font-size: 14px;
        }
        .protocolo {
          margin-bottom: 16px;
          border: 1px solid #99afc2;
          border-radius: 10px;
          background: #edf3f9;
          padding: 12px;
        }
        .protocolo strong {
          font-size: 20px;
          color: var(--azul);
        }
        .bloco {
          margin-top: 14px;
          border: 1px solid var(--borda);
          border-radius: 10px;
          padding: 12px;
        }
        .bloco h2 {
          margin: 0 0 8px;
          font-size: 16px;
          color: var(--azul);
        }
        .linha {
          margin: 4px 0;
          word-break: break-word;
        }
        .descricao {
          white-space: pre-wrap;
        }
        .imagens {
          display: grid;
          gap: 12px;
        }
        .bloco-imagem {
          margin: 0;
          border: 1px solid var(--borda);
          border-radius: 8px;
          overflow: hidden;
          background: #fbfdff;
          page-break-inside: avoid;
        }
        .bloco-imagem img {
          display: block;
          width: 100%;
          max-height: 380px;
          object-fit: contain;
          background: #edf3f9;
        }
        .bloco-imagem figcaption {
          padding: 8px 10px;
          color: var(--sec);
          font-size: 13px;
        }
        .vazio {
          margin: 0;
          color: var(--sec);
          font-size: 14px;
        }
        ul { margin: 0; padding-left: 18px; }
        @media print {
          body { background: #fff; padding: 0; }
          .comprovante { border: 0; border-radius: 0; max-width: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <article class="comprovante">
        <h1>Comprovante de Denúncia Anônima</h1>
        <p class="sub">Documento gerado no navegador para registro e acompanhamento da denúncia.</p>

        <section class="protocolo">
          <p class="linha"><strong>${escaparHtml(denuncia.protocolo)}</strong></p>
          <p class="linha"><b>Data e hora do registro:</b> ${escaparHtml(formatarDataHora(denuncia.criadaEm))}</p>
          <p class="linha"><b>Status atual:</b> ${escaparHtml(statusAtual)}</p>
        </section>

        <section class="bloco">
          <h2>Classificação</h2>
          <p class="linha"><b>Categoria:</b> ${escaparHtml(denuncia.categoria)}</p>
          <p class="linha"><b>Subcategoria:</b> ${escaparHtml(denuncia.subcategoria)}</p>
        </section>

        <section class="bloco">
          <h2>Descrição da denúncia</h2>
          <p class="linha descricao">${escaparHtml(denuncia.descricao)}</p>
        </section>

        <section class="bloco">
          <h2>Localização</h2>
          <p class="linha"><b>Bairro:</b> ${escaparHtml(denuncia.localizacao.bairro)}</p>
          <p class="linha"><b>Rua:</b> ${escaparHtml(denuncia.localizacao.rua)}</p>
          <p class="linha"><b>Ponto de referência:</b> ${escaparHtml(denuncia.localizacao.referencia)}</p>
          <p class="linha"><b>Resumo:</b> ${escaparHtml(localizacao)}</p>
        </section>

        <section class="bloco">
          <h2>Imagens anexadas</h2>
          <div class="imagens">${imagensHtml}</div>
        </section>

        <section class="bloco">
          <h2>Anexos não incorporados ao PDF</h2>
          ${anexosNaoImagemHtml}
        </section>
      </article>

      <script>
        window.onload = function () {
          setTimeout(function () {
            window.print();
          }, 260);
        };

        window.onafterprint = function () {
          window.close();
        };
      </script>
    </body>
    </html>
  `;
}

function escaparHtml(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

iniciarAplicacao();
