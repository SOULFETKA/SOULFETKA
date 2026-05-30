let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  if (typeof updateCartCount === 'function') updateCartCount();
}

function renderCart() {
  const container = document.getElementById('cart-content');
  if (!container) {
    console.warn('Контейнер #cart-content не найден');
    return;
  }

  // Обновляем переменную cart из localStorage (на случай изменений на других вкладках)
  cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Ваша корзина пуста</p>
        <a href="products.html">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  let total = 0;
  let itemsHtml = '';

  cart.forEach((item, idx) => {
    // Безопасное извлечение числовой цены
    let priceNum = 0;
    if (typeof item.price === 'number') {
      priceNum = item.price;
    } else if (typeof item.price === 'string') {
      priceNum = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
    }
    if (isNaN(priceNum)) priceNum = 0;

    const qty = item.quantity || 1;
    const itemTotal = priceNum * qty;
    total += itemTotal;

    // Запасное изображение, если item.image отсутствует или не загружается
    const imgSrc = item.image && item.image !== 'undefined' ? item.image : 'https://via.placeholder.com/100x100/cccccc/969696?text=Фото';

    itemsHtml += `
      <div class="cart-item" data-index="${idx}">
        <img src="${imgSrc}" alt="${item.name || 'Товар'}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100x100/cccccc/969696?text=Фото'">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name || 'Без названия'}</div>
          <div class="cart-item-price">${priceNum} ₽</div>
          <div class="cart-item-quantity">
            <button class="quantity-minus" data-index="${idx}">-</button>
            <span class="quantity-value">${qty}</span>
            <button class="quantity-plus" data-index="${idx}">+</button>
          </div>
        </div>
        <div class="cart-item-total">${itemTotal} ₽</div>
        <button class="cart-item-remove" data-index="${idx}"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
  });

  container.innerHTML = `
    ${itemsHtml}
    <div class="cart-total">Итого: ${total} ₽</div>
    <button class="checkout-btn" id="checkout-btn">Оформить заказ</button>
  `;

  // Привязываем обработчики к динамически созданным кнопкам
  document.querySelectorAll('.quantity-plus').forEach(btn => {
    btn.removeEventListener('click', handlePlus);
    btn.addEventListener('click', handlePlus);
  });
  document.querySelectorAll('.quantity-minus').forEach(btn => {
    btn.removeEventListener('click', handleMinus);
    btn.addEventListener('click', handleMinus);
  });
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.removeEventListener('click', handleRemove);
    btn.addEventListener('click', handleRemove);
  });

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.removeEventListener('click', handleCheckout);
    checkoutBtn.addEventListener('click', handleCheckout);
  }
}

// Отдельные функции-обработчики для удобства
function handlePlus(e) {
  const idx = parseInt(e.currentTarget.dataset.index);
  if (isNaN(idx)) return;
  cart[idx].quantity = (cart[idx].quantity || 1) + 1;
  saveCart();
  renderCart();
}

function handleMinus(e) {
  const idx = parseInt(e.currentTarget.dataset.index);
  if (isNaN(idx)) return;
  if (cart[idx].quantity > 1) {
    cart[idx].quantity -= 1;
    saveCart();
    renderCart();
  } else {
    cart.splice(idx, 1);
    saveCart();
    renderCart();
  }
}

function handleRemove(e) {
  const idx = parseInt(e.currentTarget.dataset.index);
  if (isNaN(idx)) return;
  cart.splice(idx, 1);
  saveCart();
  renderCart();
}

function handleCheckout() {
  // Проверяем авторизацию через глобальную функцию API
  if (typeof API !== 'undefined' && API.getCurrentUser) {
    const currentUser = API.getCurrentUser();
    if (!currentUser) {
      if (typeof showNotification === 'function') {
        showNotification('Для оформления заказа войдите в профиль', 'error');
      } else {
        alert('Для оформления заказа войдите в профиль');
      }
      setTimeout(() => {
        window.location.href = 'login.html?redirect=cart.html';
      }, 1000);
      return;
    }
  }
  window.location.href = 'checkout.html';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  // Дополнительно обновляем счётчики (на всякий случай)
  if (typeof updateCartCount === 'function') updateCartCount();
  if (typeof updateFavoritesCount === 'function') updateFavoritesCount();
});