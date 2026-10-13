# Microbacia Ribeirão Bolívar (Cianorte-PR)

Dashboard do Programa Água Segura: visão geral, URTs, PIPs, uso do solo e estrutura fundiária.
Os dados ficam em `data/*.json`; nomes de produtores, URTs e imóveis estão anonimizados.

Para ver localmente: `python3 -m http.server` na pasta e abra http://localhost:8000.
Para publicar: Settings > Pages > Deploy from a branch > main / (root).

## Versão Next.js + shadcn (`web/`)

A pasta `web/` tem o mesmo painel refeito sobre o bloco `@blocks-so/dashboard-01`
(Next.js, Tailwind, shadcn/ui, Leaflet). Ela lê os mesmos `data/*.json`: antes de
`dev` e `build`, `web/scripts/copy-data.mjs` copia a pasta `data/` para `web/src/data/`.

```bash
cd web
npm install
npm run dev          # http://localhost:3000
npm run build        # gera o site estático em web/out/
```

O build já sai pronto para
https://rafaelfvalerio.github.io/Microbacia-Ribeir-o-bol-var/microbacia-bolivar/:
publique o conteúdo de `web/out/` na pasta `microbacia-bolivar/` do repositório.
A raiz do repositório precisa de um arquivo vazio `.nojekyll`; sem ele o Pages
ignora a pasta `_next/` e o site abre sem estilo nem scripts.
Para outro endereço, gere com `BASE_PATH=/caminho npm run build`.
