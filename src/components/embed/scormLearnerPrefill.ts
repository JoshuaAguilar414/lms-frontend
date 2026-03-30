/**
 * Best-effort fill for common SCORM / Storyline / Rise "enter your name" modals.
 * Only runs in same-origin iframe documents (our /uploads proxy).
 */

export interface ScormLearnerInfo {
  name: string;
  email: string;
}

function setInputValue(el: HTMLInputElement, value: string): boolean {
  if (!value || el.value?.trim()) return false;
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  if (desc?.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function prefillInDocument(doc: Document, learner: ScormLearnerInfo): void {
  const inputs = [...doc.querySelectorAll<HTMLInputElement>('input')].filter((i) =>
    !['hidden', 'submit', 'button', 'checkbox', 'radio', 'file', 'image'].includes(i.type)
  );

  for (const el of inputs) {
    const hay = `${el.name} ${el.id} ${el.placeholder} ${el.type}`.toLowerCase();
    if (el.type === 'email' || hay.includes('email') || hay.includes('e-mail')) {
      setInputValue(el, learner.email);
    }
  }

  let nameFilled = false;
  for (const el of inputs) {
    const hay = `${el.name} ${el.id} ${el.placeholder}`.toLowerCase();
    if (hay.includes('email') || hay.includes('e-mail')) continue;
    if (
      hay.includes('name') ||
      hay.includes('learner') ||
      hay.includes('student') ||
      hay.includes('full name') ||
      hay.includes('your name')
    ) {
      if (setInputValue(el, learner.name)) nameFilled = true;
      break;
    }
  }

  if (!nameFilled) {
    const textLike = inputs.filter((el) => {
      const t = (el.type || 'text').toLowerCase();
      if (t !== 'text' && t !== 'search' && t !== '') return false;
      const hay = `${el.name} ${el.id} ${el.placeholder}`.toLowerCase();
      return !hay.includes('email') && !hay.includes('e-mail');
    });
    const first = textLike[0];
    if (first) setInputValue(first, learner.name);
  }
}

function walkSameOriginIframes(doc: Document, fn: (d: Document) => void): void {
  fn(doc);
  doc.querySelectorAll('iframe').forEach((frame) => {
    try {
      const child = frame.contentDocument;
      if (child?.body) walkSameOriginIframes(child, fn);
    } catch {
      /* cross-origin */
    }
  });
}

/** Run prefill once per document tree (including nested same-origin iframes). */
export function prefillScormLearnerFields(rootDoc: Document, learner: ScormLearnerInfo): void {
  walkSameOriginIframes(rootDoc, (d) => prefillInDocument(d, learner));
}
