/**
 * Carregamento sob demanda do flatpickr (JS + CSS + locale pt).
 *
 * flatpickr custa ~50 KB de JS + ~15 KB de CSS que só são usados quando o
 * usuário interage com um campo de data. Importar estático joga esse peso no
 * caminho crítico de toda página. Aqui a lib só baixa no primeiro focus/click
 * de um campo `[data-datepicker]` (ou na primeira chamada de `loadFlatpickr()`).
 *
 * O CSS base da lib fica em `public/vendor/flatpickr.min.css` e é injetado via
 * `<link>` on-demand — import dinâmico de CSS é hoistado pelo Vite para
 * render-blocking, então não serve. O tema (cores) continua no CSS da página.
 */

type FlatpickrFn = (
  el: Element | string,
  config?: Record<string, unknown>,
) => { open: () => void };

let loader: Promise<FlatpickrFn> | null = null;

function ensureCss() {
  if (document.getElementById('flatpickr-css')) return;
  const link = document.createElement('link');
  link.id = 'flatpickr-css';
  link.rel = 'stylesheet';
  link.href = '/vendor/flatpickr.min.css';
  document.head.appendChild(link);
}

/** Baixa flatpickr + locale pt na primeira chamada; reusa a promise depois. */
export function loadFlatpickr(): Promise<FlatpickrFn> {
  if (!loader) {
    ensureCss();
    loader = Promise.all([
      import('flatpickr'),
      import('flatpickr/dist/l10n/pt.js'),
    ]).then(([fp, l10n]) => {
      const flatpickr = (fp as any).default as FlatpickrFn & {
        localize: (l: unknown) => void;
      };
      flatpickr.localize((l10n as any).Portuguese);
      return flatpickr;
    });
  }
  return loader;
}

const DEFAULT_OPTS = { dateFormat: 'd/m/Y', minDate: 'today', disableMobile: false };

/**
 * Liga cada `[data-datepicker]` para inicializar o flatpickr no primeiro
 * focus/click. Idempotente — pode ser chamado de novo sem religar campos.
 */
export function initDatepickers(opts: Record<string, unknown> = DEFAULT_OPTS) {
  document.querySelectorAll<HTMLInputElement>('[data-datepicker]').forEach((el) => {
    if (el.dataset.fpBound) return;
    el.dataset.fpBound = '1';

    const activate = async () => {
      el.removeEventListener('focus', activate);
      el.removeEventListener('click', activate);
      const flatpickr = await loadFlatpickr();
      const inst = (el as any)._flatpickr || flatpickr(el, opts);
      inst.open();
    };

    el.addEventListener('focus', activate);
    el.addEventListener('click', activate);
  });
}
