class ProductMegaMenu extends HTMLElement {
  connectedCallback() {
    this.events = new AbortController();
    this.overlay = this.querySelector('[data-pm-overlay]');
    this.items = this.querySelectorAll('.pm-top');
    this.hover = matchMedia('(hover: hover)');
    this.desktop = matchMedia('(min-width: 990px)');
    const options = { signal: this.events.signal };

    for (const item of this.items) {
      item.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse') this.show(item);
      }, options);
    }

    this.addEventListener('pointerleave', () => {
      if (!this.active?.contains(document.activeElement)) this.show();
    }, options);
    this.addEventListener('pointerover', (event) => {
      const category = event.target.closest('[data-pm-category]');
      if (category && event.pointerType === 'mouse') this.select(category.dataset.pmCategory);
    }, options);
    this.addEventListener('click', (event) => {
      const button = event.target.closest('button[aria-controls]');
      if (!button) return;
      const item = button.closest('.pm-top');
      if (button.parentElement === item) {
        this.show(this.active === item && (event.detail === 0 || !this.hover.matches) ? null : item);
      } else {
        this.select(button.getAttribute('aria-controls'));
      }
    }, options);
    this.addEventListener('focusout', (event) => {
      if (!this.active?.contains(event.relatedTarget)) this.show();
    }, options);
    document.addEventListener('pointerdown', (event) => {
      if (!this.contains(event.target) || event.target === this.overlay) this.show();
    }, options);
    document.addEventListener('keydown', (event) => {
      if (!this.active || event.key !== 'Escape') return;
      const button = this.active.querySelector(':scope > button');
      if (!this.active.contains(document.activeElement) && document.activeElement !== document.body) return;
      event.preventDefault();
      button.focus();
      this.show();
    }, options);
    this.desktop.addEventListener('change', () => this.show(), options);
  }

  disconnectedCallback() {
    this.events.abort();
    this.show();
  }

  show(item) {
    const button = item?.querySelector(':scope > button');
    const next = button && this.desktop.matches ? item : null;
    if (this.active === next) return;
    if (this.active) {
      this.active.querySelector(':scope > button').setAttribute('aria-expanded', 'false');
      this.active.querySelector(':scope > .pm-panel').hidden = true;
    }
    this.active = next;
    this.overlay.hidden = !next;
    this.closest('sticky-header')?.toggleAttribute('data-pm-open', Boolean(next));
    if (!next) return;
    button.setAttribute('aria-expanded', 'true');
    const panel = next.querySelector(':scope > .pm-panel');
    panel.hidden = false;
    panel.style.setProperty('--pm-offset', `${Math.max(0, panel.getBoundingClientRect().top)}px`);
  }

  select(id) {
    if (!this.active) return;
    for (const panel of this.active.querySelectorAll('.pm-category-panel')) {
      if (panel.contains(document.activeElement) && panel.id !== id) return;
    }
    for (const panel of this.active.querySelectorAll('.pm-category-panel')) {
      panel.hidden = panel.id !== id;
    }
    for (const button of this.active.querySelectorAll('.pm-categories button')) {
      button.setAttribute('aria-expanded', String(button.getAttribute('aria-controls') === id));
    }
  }
}

class ProductMenuDrawer extends HTMLElement {
  connectedCallback() {
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    this.dialog = this.querySelector('dialog');
    this.trigger = this.querySelector('[data-pm-open]');
    this.rootPage = this.querySelector('[data-pm-page]');
    this.page = this.rootPage;
    this.stack = [];
    this.trigger.addEventListener('click', () => {
      this.dialog.showModal();
      this.trigger.setAttribute('aria-expanded', 'true');
      this.ownsScrollLock = !document.body.classList.contains('overflow-hidden-tablet');
      document.body.classList.add('overflow-hidden-tablet');
    }, options);
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog || event.target.closest('[data-pm-close]')) {
        this.dialog.close();
        return;
      }
      const opener = event.target.closest('[data-pm-enter]');
      if (opener) {
        const next = document.getElementById(opener.dataset.pmEnter);
        if (!next || !this.dialog.contains(next)) return;
        this.stack.push({ page: this.page, opener });
        this.showPage(next, next.querySelector('[data-pm-back]'), 'forward');
      } else if (event.target.closest('[data-pm-back]') && this.stack.length) {
        const { page, opener: previous } = this.stack.pop();
        this.showPage(page, previous, 'back');
      }
    }, options);
    this.dialog.addEventListener('close', () => {
      this.unlock();
      this.showPage(this.rootPage);
      this.stack = [];
    }, options);
    matchMedia('(min-width: 990px)').addEventListener('change', (event) => {
      if (event.matches && this.dialog.open) this.dialog.close();
    }, options);
  }

  showPage(next, focusTarget, direction) {
    this.page.inert = true;
    this.page.hidden = true;
    this.page = next;
    next.dataset.direction = direction || '';
    next.hidden = false;
    next.inert = false;
    focusTarget?.focus({ preventScroll: true });
  }

  unlock() {
    if (this.ownsScrollLock) document.body.classList.remove('overflow-hidden-tablet');
    this.ownsScrollLock = false;
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  disconnectedCallback() {
    this.events.abort();
    if (this.dialog.open) this.dialog.close();
    this.unlock();
  }
}

if (!customElements.get('product-mega-menu')) customElements.define('product-mega-menu', ProductMegaMenu);
if (!customElements.get('product-menu-drawer')) customElements.define('product-menu-drawer', ProductMenuDrawer);
