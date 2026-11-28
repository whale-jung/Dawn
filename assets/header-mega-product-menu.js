/**
 * Product mega menu (menu_type_desktop === 'mega-product').
 *
 * - Hover a top-level link to open its panel; hovering another link swaps
 *   panels instantly; leaving the nav collapses the panel.
 * - Click a category tab to switch the product grid.
 */
(function () {
  var menu = document.querySelector('.header__inline-menu');
  if (!menu) return;

  var openBox = null;

  menu.addEventListener('mouseover', function (event) {
    var li = event.target.closest('.list-menu--inline > li');
    if (!li) return;

    var box = li.querySelector('.product-mega-menu');

    if (!box) {
      // Hovering a link with no panel: collapse the current one (with animation).
      if (openBox) {
        openBox.classList.remove('is-open');
        openBox = null;
      }
      return;
    }

    if (box === openBox) return;

    if (openBox) {
      // Swap instantly between two panels, no open/close animation.
      openBox.classList.add('is-swapping');
      box.classList.add('is-swapping');
      openBox.classList.remove('is-open');
      box.classList.add('is-open');
      void box.offsetWidth; // force reflow so the change above applies under transition:none
      openBox.classList.remove('is-swapping');
      box.classList.remove('is-swapping');
    } else {
      // First open: with animation.
      box.classList.add('is-open');
    }

    openBox = box;
  });

  menu.addEventListener('mouseleave', function () {
    if (openBox) {
      openBox.classList.remove('is-open');
      openBox = null;
    }
  });

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-mega-filter-btn]');
    if (!button) return;

    var box = button.closest('[data-product-mega-menu]');
    if (!box) return;

    var target = button.getAttribute('data-target');

    box.querySelectorAll('[data-mega-filter-btn]').forEach(function (btn) {
      var active = btn === button;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    box.querySelectorAll('[data-mega-panel]').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-mega-panel') === target);
    });
  });
})();
