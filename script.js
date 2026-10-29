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
