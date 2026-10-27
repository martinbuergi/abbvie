import { loadCSS } from './aem.js';

/*
 * Site-wide widget: external-link departure warning (observed on abbvie.com — the source opens
 * /modal-fragment/warn-departure-modal for every link carrying data-warn-departure-modal-path).
 * Here any link with a `data-warn-departure` attribute (the footer's social and external-link
 * columns) opens the modal; "Yes, I Agree" continues to the link, everything else stays.
 * Copy is the source modal's, verbatim.
 */

const COPY = {
  title: 'You are about to leave the AbbVie website',
  body: 'The product-specific site Internet site that you have requested is intended for the '
    + 'residents of a particular country or countries, as noted on that site. As a result, the '
    + 'site may contain information on pharmaceuticals that are not approved in other countries '
    + 'or region. If you are a resident of a country other than those to which the site is '
    + 'directed, please return to AbbVie.com or contact your local AbbVie affiliate to obtain '
    + 'the appropriate product information for your country of residence. The Internet site '
    + 'that you have requested may not be optimized to your screen size. Do you wish to '
    + 'continue to this product-specific site?',
  disagree: 'No, I Disagree',
  agree: 'Yes, I Agree',
  close: 'Close',
};

let dialog;
let pending;

function button(className, text) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = className;
  b.textContent = text;
  return b;
}

function buildDialog() {
  const d = document.createElement('dialog');
  d.className = 'departure-modal';
  d.setAttribute('aria-labelledby', 'departure-modal-title');
  const box = document.createElement('div');
  box.className = 'departure-modal-box';
  const close = button('departure-modal-close', '');
  close.setAttribute('aria-label', COPY.close);
  const title = document.createElement('h5');
  title.id = 'departure-modal-title';
  title.className = 'departure-modal-title';
  title.textContent = COPY.title;
  const body = document.createElement('p');
  body.className = 'departure-modal-body';
  body.textContent = COPY.body;
  const actions = document.createElement('div');
  actions.className = 'departure-modal-actions';
  const no = button('departure-modal-btn departure-modal-disagree', COPY.disagree);
  const yes = button('departure-modal-btn departure-modal-agree', COPY.agree);
  actions.append(no, yes);
  box.append(close, title, body, actions);
  d.append(box);

  const dismiss = () => {
    pending = null;
    d.close();
  };
  close.addEventListener('click', dismiss);
  no.addEventListener('click', dismiss);
  d.addEventListener('click', (e) => {
    if (e.target === d) dismiss();
  });
  yes.addEventListener('click', () => {
    const link = pending;
    dismiss();
    if (!link) return;
    if (link.target === '_blank') window.open(link.href, '_blank', 'noopener');
    else window.location.assign(link.href);
  });
  document.body.append(d);
  return d;
}

loadCSS(`${window.hlx.codeBasePath}/styles/departure-modal.css`);

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-warn-departure]');
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  dialog = dialog || buildDialog();
  pending = link;
  dialog.showModal();
}, true);
