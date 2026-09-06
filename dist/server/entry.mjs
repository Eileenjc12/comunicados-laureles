import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BXz04_in.mjs';
import { manifest } from './manifest_IAc-pty8.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/comunicados/nuevo.astro.mjs');
const _page2 = () => import('./pages/admin/comunicados/_id_/editar.astro.mjs');
const _page3 = () => import('./pages/admin/lecturas/_id_.astro.mjs');
const _page4 = () => import('./pages/admin/login.astro.mjs');
const _page5 = () => import('./pages/admin/mercado.astro.mjs');
const _page6 = () => import('./pages/admin.astro.mjs');
const _page7 = () => import('./pages/api/admin/announcements/_id_/archive.astro.mjs');
const _page8 = () => import('./pages/api/admin/announcements/_id_/export-csv.astro.mjs');
const _page9 = () => import('./pages/api/admin/announcements/_id_/pin.astro.mjs');
const _page10 = () => import('./pages/api/admin/announcements/_id_/reads.astro.mjs');
const _page11 = () => import('./pages/api/admin/announcements/_id_/whatsapp-reminder.astro.mjs');
const _page12 = () => import('./pages/api/admin/announcements/_id_.astro.mjs');
const _page13 = () => import('./pages/api/admin/announcements.astro.mjs');
const _page14 = () => import('./pages/api/admin/login.astro.mjs');
const _page15 = () => import('./pages/api/admin/logout.astro.mjs');
const _page16 = () => import('./pages/api/admin/marketplace/_id_/status.astro.mjs');
const _page17 = () => import('./pages/api/admin/marketplace.astro.mjs');
const _page18 = () => import('./pages/api/admin/metrics.astro.mjs');
const _page19 = () => import('./pages/api/announcements/_id_/confirm.astro.mjs');
const _page20 = () => import('./pages/api/announcements/_id_/view.astro.mjs');
const _page21 = () => import('./pages/api/announcements/_slug_.astro.mjs');
const _page22 = () => import('./pages/api/announcements.astro.mjs');
const _page23 = () => import('./pages/api/census/properties.astro.mjs');
const _page24 = () => import('./pages/api/marketplace/submit.astro.mjs');
const _page25 = () => import('./pages/api/marketplace.astro.mjs');
const _page26 = () => import('./pages/comunicados/_slug_.astro.mjs');
const _page27 = () => import('./pages/mercado/postular.astro.mjs');
const _page28 = () => import('./pages/mercado.astro.mjs');
const _page29 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/comunicados/nuevo.astro", _page1],
    ["src/pages/admin/comunicados/[id]/editar.astro", _page2],
    ["src/pages/admin/lecturas/[id].astro", _page3],
    ["src/pages/admin/login.astro", _page4],
    ["src/pages/admin/mercado.astro", _page5],
    ["src/pages/admin/index.astro", _page6],
    ["src/pages/api/admin/announcements/[id]/archive.ts", _page7],
    ["src/pages/api/admin/announcements/[id]/export-csv.ts", _page8],
    ["src/pages/api/admin/announcements/[id]/pin.ts", _page9],
    ["src/pages/api/admin/announcements/[id]/reads.ts", _page10],
    ["src/pages/api/admin/announcements/[id]/whatsapp-reminder.ts", _page11],
    ["src/pages/api/admin/announcements/[id].ts", _page12],
    ["src/pages/api/admin/announcements/index.ts", _page13],
    ["src/pages/api/admin/login.ts", _page14],
    ["src/pages/api/admin/logout.ts", _page15],
    ["src/pages/api/admin/marketplace/[id]/status.ts", _page16],
    ["src/pages/api/admin/marketplace/index.ts", _page17],
    ["src/pages/api/admin/metrics.ts", _page18],
    ["src/pages/api/announcements/[id]/confirm.ts", _page19],
    ["src/pages/api/announcements/[id]/view.ts", _page20],
    ["src/pages/api/announcements/[slug].ts", _page21],
    ["src/pages/api/announcements/index.ts", _page22],
    ["src/pages/api/census/properties.ts", _page23],
    ["src/pages/api/marketplace/submit.ts", _page24],
    ["src/pages/api/marketplace/index.ts", _page25],
    ["src/pages/comunicados/[slug].astro", _page26],
    ["src/pages/mercado/postular.astro", _page27],
    ["src/pages/mercado/index.astro", _page28],
    ["src/pages/index.astro", _page29]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///D:/COMUNICADOS-LAURELES/dist/client/",
    "server": "file:///D:/COMUNICADOS-LAURELES/dist/server/",
    "host": true,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
