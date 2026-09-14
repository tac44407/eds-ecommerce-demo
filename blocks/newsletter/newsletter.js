const DEFAULT_TITLE = 'Sign up for our newsletter';
const DEFAULT_COPY = 'Get 15% off and new drops. No spam.';
const SUCCESS = "Thanks — you're on the list.";

function cellText(cell) {
  return cell?.textContent.replace(/\s+/g, ' ').trim() || '';
}

function readAuthored(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  return {
    title: cellText(cells[0]) || DEFAULT_TITLE,
    copy: cellText(cells[1]) || DEFAULT_COPY,
  };
}

function createForm() {
  const form = document.createElement('form');
  form.className = 'newsletter-form';
  form.noValidate = false;

  const label = document.createElement('label');
  label.className = 'newsletter-label';
  label.htmlFor = 'newsletter-email';
  label.textContent = 'Email';

  const field = document.createElement('div');
  field.className = 'newsletter-field';

  const input = document.createElement('input');
  input.id = 'newsletter-email';
  input.name = 'email';
  input.type = 'email';
  input.required = true;
  input.autocomplete = 'email';
  input.placeholder = 'Enter email';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'newsletter-submit';
  submit.textContent = 'Subscribe';

  field.append(input, submit);
  form.append(label, field);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const done = document.createElement('p');
    done.className = 'newsletter-success';
    done.textContent = SUCCESS;
    form.replaceWith(done);
  });

  return form;
}

export default function decorate(block) {
  const { title, copy } = readAuthored(block);
  const heading = document.createElement('h2');
  heading.className = 'newsletter-title';
  heading.textContent = title;
  const body = document.createElement('p');
  body.className = 'newsletter-copy';
  body.textContent = copy;
  block.replaceChildren(heading, body, createForm());
}
