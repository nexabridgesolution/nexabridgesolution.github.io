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


/* NexaBridge custom thank-you redirect: only after a confirmed Formspree response. */
const nexaInquiryForm = document.getElementById('contactForm');
if (nexaInquiryForm) {
  const sendButton = document.getElementById('submitButton');
  const formNote = document.getElementById('formNote');
  let sending = false;

  nexaInquiryForm.addEventListener('submit', async (event) => {
    if (typeof fetch !== 'function') return; // Keep native POST fallback.
    event.preventDefault();
    if (sending || !nexaInquiryForm.reportValidity()) return;
    sending = true;
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';
    }
    if (formNote) formNote.textContent = 'Sending your message securely...';

    try {
      const response = await fetch(nexaInquiryForm.action, {
        method: 'POST',
        body: new FormData(nexaInquiryForm),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        window.location.assign(new URL('thank-you.html', document.baseURI).href);
        return;
      }
      let result = null;
      try { result = await response.json(); } catch (_) {}
      const errors = result && Array.isArray(result.errors)
        ? result.errors.map(error => error.message).filter(Boolean).join(' ')
        : '';
      if (formNote) formNote.textContent = errors ||
        'Message not sent. Please try again, or email nexabridgeops@gmail.com directly.';
    } catch (_) {
      if (formNote) formNote.textContent =
        'Could not confirm delivery. Please check your connection before trying again, or email nexabridgeops@gmail.com.';
    } finally {
      sending = false;
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Send Message';
      }
    }
  });
}
