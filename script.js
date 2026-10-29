const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


async function loadNexaBridgeUpdates(limit = 3, targetId = 'updatesGrid') {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const res = await fetch('/posts/posts.json', { cache: 'no-store' });
    const data = await res.json();
    const posts = Array.isArray(data) ? data : (data.posts || []);
    const items = posts.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    target.innerHTML = items.map(post => `
      <article class="update-card reveal is-visible">
        ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
        <div class="update-card-body">
          <p class="update-date">${new Date(post.date + 'T00:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</p>
          <h3>${post.title}</h3>
          <p>${post.excerpt || ''}</p>
          ${post.linkedin_url ? `<a class="update-link" href="${post.linkedin_url}" target="_blank" rel="noopener noreferrer">View on LinkedIn →</a>` : ''}
        </div>
      </article>`).join('');
  } catch (e) {
    target.innerHTML = '<article class="update-card"><div class="update-card-body"><h3>Updates coming soon</h3><p>Check back for the latest from NexaBridge Solutions.</p></div></article>';
  }
}
loadNexaBridgeUpdates();

/* Contact form email fallback while the external submission host is unavailable. */
const nexaContactForm = document.getElementById('contactForm');
if (nexaContactForm) {
  const status = document.getElementById('formNote');
  const destination = 'nexabridgeops@gmail.com';
  const subject = 'New NexaBridge Website Inquiry';

  function contactEmailBody() {
    const data = new FormData(nexaContactForm);
    return [
      'NexaBridge Solutions — Website Inquiry',
      '',
      'Name: ' + String(data.get('name') || '').trim(),
      'Company: ' + String(data.get('company') || '').trim(),
      'Email: ' + String(data.get('email') || '').trim(),
      '',
      'Message:',
      String(data.get('message') || '').trim()
    ].join('\n');
  }

  function prepareEmail(useGmail) {
    if (!nexaContactForm.reportValidity()) return;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(contactEmailBody());
    if (useGmail) {
      const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' +
        encodeURIComponent(destination) + '&su=' + encodedSubject + '&body=' + encodedBody;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = 'mailto:' + destination + '?subject=' + encodedSubject + '&body=' + encodedBody;
    }
    if (status) {
      status.textContent = 'Your email draft is ready. Please review it and press Send in your email account. No message has been sent automatically. If no draft opened, choose another option or copy your message.';
    }
  }

  nexaContactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    prepareEmail(true);
  });

  const emailAppButton = document.getElementById('emailAppButton');
  if (emailAppButton) {
    emailAppButton.addEventListener('click', function () {
      prepareEmail(false);
    });
  }

  const copyButton = document.getElementById('copyContactButton');
  if (copyButton) {
    copyButton.addEventListener('click', async function () {
      if (!nexaContactForm.reportValidity()) return;
      const message = 'To: ' + destination + '\nSubject: ' + subject + '\n\n' + contactEmailBody();
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(message);
        if (status) status.textContent = 'Message copied. Paste it into an email to nexabridgeops@gmail.com and press Send.';
      } catch (error) {
        window.prompt('Copy your message and email it to nexabridgeops@gmail.com:', message);
        if (status) status.textContent = 'Copy your message from the dialog, then paste it into your email and press Send.';
      }
    });
  }
}
