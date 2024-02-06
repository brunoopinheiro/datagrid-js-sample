# datagrid-js-sample
Repository to keep an example of implementation of @glideapps datagrid for React.

This repository uses the `Scryfall API` to fetch a bulk of data to be displayed in the datagrid. The updates made in each cell would normally be sent via PUT to a API, but for the purposes of this implementation, they are only saved locally to be displayed in a second page.


## Instalando o Glide Data Grid
**Pré-Requisitos:**
- Node.js instalado.
- Setup de um projeto react.
  - A glide recomenda um projeto em Typescript, no entanto, é possível implementar também em um projeto Javascript.

1. No diretório do projeto, rode o comando:
```
  npm install @glideapps/glide-data-grid
```
2. Pode ser necessário instalar todas ou algumas das dependências do datagrid:
```
  npm i lodash marked react-responsive-carousel
```

## Setup no projeto
1. É bastante provável que o datagrid seja utilizado não somente para exibir informações, como também para editar esses dados. Nesse caso, no final da tag `<body>` do HTML base do projeto react, é necessário adicionar uma div utilizada pelo datagrid para exibir a célula de edição:
```
<div id="portal" style="position: fixed; left: 0; top: 0; z-index: 9999;" />
```

2. Siga o restante da implementação documentada no arquivo [Datagrid.jsx](./src/components/Datagrid.jsx).
