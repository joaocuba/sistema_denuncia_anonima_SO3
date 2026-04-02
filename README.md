# Canal Seguro de Denúncias Anônimas

## Objetivo do sistema
Aplicação web estática para registro e acompanhamento de denúncias anônimas, com foco em simplicidade, organização visual, segurança percebida e fácil publicação no GitHub Pages.

## Funcionalidades implementadas
- Registro de denúncia anônima sem exigir dados pessoais obrigatórios.
- Seleção organizada de categoria e subcategoria em blocos visuais.
- Campos de descrição e localização (`bairro`, `rua`, `ponto de referência`).
- Anexos de evidências simulados no front-end (imagem, vídeo e documento), com exibição dos nomes selecionados.
- Geração automática de protocolo no formato `DEN-AAAA-000000`.
- Consulta de status por protocolo.
- Geração de comprovante em PDF da denúncia recém-registrada, com:
  - protocolo
  - data/hora
  - categoria/subcategoria
  - descrição
  - localização
  - status
  - imagens anexadas (quando houver)
  - nomes dos anexos não incorporados (vídeo/documento)
- Persistência local via `localStorage`.
- Fluxo mockado de status:
  - `denúncia recebida`
  - `em análise`
  - `encaminhada`
  - `concluída`

## Estrutura de arquivos
```text
Aplicação/
├─ index.html
├─ style.css
├─ script.js
├─ README.md
└─ imagens/
```

## Como executar localmente
1. Abra a pasta `Aplicação`.
2. Clique duas vezes no arquivo `index.html` ou abra no navegador de sua preferência.
3. A aplicação funciona sem backend e sem instalação de dependências.

## Como publicar no GitHub Pages
1. Envie a pasta/projeto para um repositório no GitHub.
2. Em `Settings` > `Pages`, configure:
   - `Source`: branch principal (ex.: `main`)
   - Pasta: raiz (`/root`) ou `/docs` (conforme organização do repositório)
3. Salve as configurações e aguarde o link público ser gerado pelo GitHub.

## Exportação do PDF
- O botão `Baixar comprovante em PDF` aparece na área de sucesso após o envio da denúncia.
- A implementação é 100% front-end, sem backend e sem bibliotecas externas.
- O comprovante é montado em uma nova janela com layout próprio e aberto no fluxo de impressão do navegador.
- Para salvar em PDF, selecione a opção `Salvar como PDF` na caixa de impressão.
- O título do comprovante usa o padrão `denuncia-DEN-AAAA-000000.pdf`, ajudando a manter nome de arquivo consistente.

## Persistência em localStorage
- Os dados são salvos localmente no navegador do usuário, usando:
  - chave de denúncias: `denuncias_anonimas_v1`
  - chave de contador de protocolo por ano: `denuncias_contador_por_ano_v1`
- Cada denúncia registra:
  - protocolo
  - categoria/subcategoria
  - descrição
  - localização
  - nomes dos anexos selecionados
  - status
  - data/hora de criação e atualização

## Limitações da aplicação estática
- Não existe backend, banco de dados ou API.
- Os anexos são apenas simulados (não há upload real para servidor).
- A consulta de protocolo funciona apenas no navegador/dispositivo em que a denúncia foi registrada, pois os dados ficam no `localStorage`.
- O PDF é gerado no navegador e depende do recurso de impressão/salvar em PDF do próprio navegador.
