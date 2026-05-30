// ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ (корзина, избранное, уведомления) ==========

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems === 0 ? 'none' : 'flex';
  });
}

function updateFavoritesCount() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const count = favorites.length;
  document.querySelectorAll('#favorites-count').forEach(el => {
    el.textContent = count;
    el.style.display = count === 0 ? 'none' : 'flex';
  });
}

function showNotification(message, type = 'success') {
  let notification = document.getElementById('custom-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'custom-notification';
    notification.className = 'custom-notification';
    notification.innerHTML = `
      <div class="notification-content ${type}">
        <span class="notification-message"></span>
        <button class="notification-close">Закрыть</button>
      </div>
    `;
    document.body.appendChild(notification);
  }
  const msgSpan = notification.querySelector('.notification-message');
  msgSpan.textContent = message;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 3000);
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) closeBtn.onclick = () => notification.classList.remove('show');
}

// ========== БУРГЕР-МЕНЮ ==========
function initBurgerMenu() {
  const burgerToggle = document.getElementById('burger-toggle');
  const burgerIcon = document.querySelector('.burger-icon');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!burgerToggle || !burgerIcon || !mobileMenu) return;
  
  const iconEl = burgerIcon.querySelector('i');
  function syncMenuState() {
    mobileMenu.style.display = burgerToggle.checked ? 'block' : 'none';
    if (iconEl) {
      if (burgerToggle.checked) {
        iconEl.classList.remove('fa-bars');
        iconEl.classList.add('fa-xmark');
      } else {
        iconEl.classList.remove('fa-xmark');
        iconEl.classList.add('fa-bars');
      }
    }
  }
  burgerIcon.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    burgerToggle.checked = !burgerToggle.checked;
    syncMenuState();
  });
  burgerToggle.addEventListener('change', syncMenuState);
  document.addEventListener('click', (e) => {
    if (!burgerToggle.checked) return;
    if (mobileMenu.contains(e.target) || burgerIcon.contains(e.target)) return;
    burgerToggle.checked = false;
    syncMenuState();
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burgerToggle.checked = false;
      syncMenuState();
    });
  });
  syncMenuState();
}

// ========== АККОРДЕОН FAQ ==========
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionDiv = item.querySelector('.faq-question');
    if (!questionDiv) return;
    const icon = questionDiv.querySelector('.faq-toggle i');
    questionDiv.addEventListener('click', () => {
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        icon?.classList.remove('fa-plus');
        icon?.classList.add('fa-minus');
      } else {
        icon?.classList.remove('fa-minus');
        icon?.classList.add('fa-plus');
      }
    });
  });
}

// ========== АНИМАЦИЯ КАРТОЧЕК ==========
function initFeatureAnimation() {
  const cards = document.querySelectorAll('.feature-card[data-animate]');
  if (!cards.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach(card => card.classList.add('show'));
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const grid = document.querySelector('.features-grid');
  if (grid) observer.observe(grid);
}

// ========== МОДАЛЬНЫЕ ОКНА (контакты) ==========
function initModals() {
  const contactBtn = document.querySelector('.faq-contact-btn');
  const contactModal = document.getElementById('contactModal');
  if (contactBtn && contactModal) {
    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.style.display = 'flex';
    });
    contactModal.querySelector('.close-modal')?.addEventListener('click', () => {
      contactModal.style.display = 'none';
    });
  }
  window.addEventListener('click', (e) => {
    if (e.target.classList?.contains('contact-modal')) e.target.style.display = 'none';
  });
}

// ========== ОБНОВЛЕНИЕ ПРОФИЛЯ ==========
function loadUserProfile() {
  const user = API.getCurrentUser();
  if (!user) return null;
  const profile = JSON.parse(localStorage.getItem('user_profile')) || {};
  return { ...user, phone: profile.phone || '', address: profile.address || '' };
}

function saveUserProfile(phone, address) {
  const user = API.getCurrentUser();
  if (!user) return;
  const profile = { phone, address };
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

// ========== ПОДАРОЧНЫЙ СЕРТИФИКАТ (создание заказа) ==========
function initGiftCertificate() {
  const giftForm = document.getElementById('giftForm');
  if (!giftForm) {
    console.warn('Форма подарочного сертификата не найдена');
    return;
  }

  // ---------- Логика выбора номинала ----------
  const amountOptions = document.querySelectorAll('.amount-option:not(.custom-input)');
  const customAmountBtn = document.getElementById('customAmountBtn');
  const customAmountInput = document.getElementById('customAmountInput');
  let selectedAmount = 500;

  amountOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      amountOptions.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (customAmountInput) customAmountInput.style.display = 'none';
      if (customAmountBtn) customAmountBtn.style.display = 'inline-block';
      selectedAmount = parseInt(btn.getAttribute('data-nominal'));
    });
  });
  if (amountOptions[0]) amountOptions[0].classList.add('active');

  if (customAmountBtn) {
    customAmountBtn.addEventListener('click', () => {
      amountOptions.forEach(btn => btn.classList.remove('active'));
      customAmountBtn.style.display = 'none';
      if (customAmountInput) customAmountInput.style.display = 'inline-block';
      selectedAmount = null;
    });
  }

  if (customAmountInput) {
    customAmountInput.addEventListener('blur', () => {
      if (!customAmountInput.value.trim()) {
        customAmountInput.style.display = 'none';
        if (customAmountBtn) customAmountBtn.style.display = 'inline-block';
        if (amountOptions[0]) amountOptions[0].classList.add('active');
        selectedAmount = 500;
      }
    });
  }

  // ---------- Обработчик отправки формы ----------
  giftForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Форма сертификата отправлена');

    const currentUser = API.getCurrentUser();
    console.log('Текущий пользователь:', currentUser);
    if (!currentUser) {
      console.log('Пользователь не авторизован');
      showNotification('Для оформления сертификата необходимо войти в профиль', 'error');
      setTimeout(() => {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      }, 1500);
      return;
    }

    // Получение суммы
    let amountDisplay = '', amountValue = 0;
    if (customAmountInput && customAmountInput.style.display === 'inline-block') {
      amountValue = parseInt(customAmountInput.value);
      if (isNaN(amountValue) || amountValue < 100) {
        showNotification('Минимальная сумма сертификата — 100 ₽', 'error');
        return;
      }
      if (amountValue > 10000) {
        showNotification('Максимальная сумма сертификата — 10 000 ₽', 'error');
        return;
      }
      amountDisplay = `${amountValue} ₽`;
    } else {
      if (!selectedAmount) {
        showNotification('Выберите номинал сертификата', 'error');
        return;
      }
      amountDisplay = `${selectedAmount} ₽`;
      amountValue = selectedAmount;
    }

    const recipientName = document.getElementById('recipientName')?.value.trim();
    const recipientEmail = document.getElementById('recipientEmail')?.value.trim();
    const giftMessage = document.getElementById('giftMessage')?.value.trim() || '';

    if (!recipientName || !recipientEmail) {
      showNotification('Заполните имя и email получателя', 'error');
      return;
    }
    if (!recipientEmail.includes('@') || !recipientEmail.includes('.')) {
      showNotification('Введите корректный email', 'error');
      return;
    }

    const giftItem = {
      name: `Подарочный сертификат на ${amountDisplay}`,
      price: `${amountValue} ₽`,
      quantity: 1,
      recipient: recipientName,
      email: recipientEmail,
      message: giftMessage
    };

    console.log('Отправляем заказ:', { userId: currentUser.id, items: [giftItem], total: amountValue });

    const orderResult = await API.createOrder({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '',
      address: 'Сертификат (электронный)',
      items: [giftItem],
      total: amountValue
    });

    console.log('Результат createOrder:', orderResult);

    if (orderResult.success) {
      // Закрыть модальное окно выбора сертификата
      const giftModal = document.getElementById('giftModal');
      if (giftModal) giftModal.style.display = 'none';

      // Создаём попап с кнопками
      const popup = document.createElement('div');
      popup.id = 'giftSuccessPopup';
      popup.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:20000;">
          <div style="background:#F4F4F1; padding:40px; border-radius:30px; text-align:center; max-width:400px; width:90%;">
            <i class="fas fa-gift" style="font-size:48px; color:#9B9A84;"></i>
            <h3 style="margin:20px 0 10px;">Сертификат успешно приобретён!</h3>
            <p>Сумма: <strong>${amountDisplay}</strong><br>Для получателя: ${recipientName}</p>
            <div style="display:flex; gap:15px; justify-content:center; margin-top:20px;">
              <button id="goToCabinetBtn" style="background:#9B9A84; color:white; border:none; padding:10px 20px; border-radius:40px; cursor:pointer;">Перейти в личный кабинет</button>
              <button id="stayOnSiteBtn" style="background:#fff; color:#333; border:none; padding:10px 20px; border-radius:40px; cursor:pointer;">Продолжить покупки</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(popup);

      // Обработчики кнопок попапа
      document.getElementById('goToCabinetBtn').addEventListener('click', () => {
        window.location.href = 'cabinet.html';
      });
      document.getElementById('stayOnSiteBtn').addEventListener('click', () => {
        popup.remove();
      });
    } else {
      showNotification('Ошибка при оформлении сертификата: ' + (orderResult.error || 'попробуйте позже'), 'error');
    }
  });

  // ---------- Открытие модального окна сертификата ----------
  const giftLink = document.getElementById('giftLink');
  const giftModal = document.getElementById('giftModal');
  if (giftLink && giftModal) {
    giftLink.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Открытие модалки сертификата');
      giftModal.style.display = 'flex';
    });
    const closeGift = giftModal.querySelector('.close-gift');
    if (closeGift) {
      closeGift.addEventListener('click', () => {
        giftModal.style.display = 'none';
      });
    }
    window.addEventListener('click', (e) => {
      if (e.target === giftModal) giftModal.style.display = 'none';
    });
  } else {
    console.warn('Ссылка или модальное окно сертификата не найдены');
  }
}
// ========== ОТЗЫВЫ (карусель, форма) ==========
let currentReviewIndex = 0;
let reviews = JSON.parse(localStorage.getItem('reviews')) || [
  { name: "Анна", rating: 5, text: "Очень красивые салфетки! Нежный цвет, качество отличное.", date: "2025-03-01" },
  { name: "Екатерина", rating: 5, text: "Скатерть просто шикарная! Доставка быстрая.", date: "2025-03-10" },
  { name: "Мария", rating: 4, text: "Хорошие салфетки, но немного дороговато.", date: "2025-03-15" }
];

function saveReviews() {
  localStorage.setItem('reviews', JSON.stringify(reviews));
}

function renderReviewsCarousel() {
  const container = document.getElementById('reviews-container');
  if (!container) return;
  if (reviews.length === 0) {
    container.innerHTML = '<div class="review-item">Пока нет отзывов. Будьте первым!</div>';
    return;
  }
  const rev = reviews[currentReviewIndex];
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<i class="fas fa-star star ${i <= rev.rating ? 'active' : ''}"></i>`;
  }
  container.innerHTML = `
    <div class="review-item">
      <div class="review-name">${rev.name}</div>
      <div class="review-rating">${starsHtml}</div>
      <div class="review-text">${rev.text}</div>
      <div class="review-date" style="font-size: 12px; color: #999;">${rev.date}</div>
    </div>
  `;
}

function nextReview() {
  if (reviews.length === 0) return;
  currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
  renderReviewsCarousel();
}

function prevReview() {
  if (reviews.length === 0) return;
  currentReviewIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
  renderReviewsCarousel();
}

function initReviews() {
  const reviewsModal = document.getElementById('reviewsModal');
  const openReviewsBtn = document.getElementById('reviewsLink');
  if (openReviewsBtn && reviewsModal) {
    openReviewsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      reviewsModal.style.display = 'flex';
      currentReviewIndex = 0;
      renderReviewsCarousel();
    });
    const closeReviews = reviewsModal.querySelector('.close-reviews');
    if (closeReviews) {
      closeReviews.addEventListener('click', () => {
        reviewsModal.style.display = 'none';
      });
    }
    const prevBtn = reviewsModal.querySelector('.carousel-prev');
    const nextBtn = reviewsModal.querySelector('.carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', prevReview);
    if (nextBtn) nextBtn.addEventListener('click', nextReview);

    const addReviewBtn = document.getElementById('addReviewBtn');
    const reviewFormDiv = document.getElementById('reviewForm');
    const submitReviewBtn = document.getElementById('submitReview');
    const cancelReviewBtn = document.getElementById('cancelReview');
    const reviewName = document.getElementById('reviewName');
    const reviewText = document.getElementById('reviewText');
    const ratingStars = document.querySelectorAll('.review-form .rating .star');
    let selectedRating = 5;

    if (ratingStars.length) {
      ratingStars.forEach((star, idx) => {
        star.addEventListener('click', () => {
          selectedRating = idx + 1;
          ratingStars.forEach((s, i) => {
            if (i <= idx) s.classList.add('active');
            else s.classList.remove('active');
          });
        });
      });
      ratingStars.forEach((s, i) => { if (i < 5) s.classList.add('active'); });
    }
    if (addReviewBtn) {
      addReviewBtn.addEventListener('click', () => {
        if (reviewFormDiv) reviewFormDiv.style.display = 'block';
      });
    }
    if (cancelReviewBtn) {
      cancelReviewBtn.addEventListener('click', () => {
        if (reviewFormDiv) reviewFormDiv.style.display = 'none';
        if (reviewName) reviewName.value = '';
        if (reviewText) reviewText.value = '';
        selectedRating = 5;
        if (ratingStars.length) {
          ratingStars.forEach((s, i) => {
            if (i < 5) s.classList.add('active');
            else s.classList.remove('active');
          });
        }
      });
    }
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('click', () => {
        const name = reviewName?.value.trim();
        const text = reviewText?.value.trim();
        if (!name || !text) {
          showNotification('Заполните имя и текст отзыва', 'error');
          return;
        }
        const newReview = {
          name: name,
          rating: selectedRating,
          text: text,
          date: new Date().toISOString().slice(0,10)
        };
        reviews.unshift(newReview);
        saveReviews();
        currentReviewIndex = 0;
        renderReviewsCarousel();
        if (reviewFormDiv) reviewFormDiv.style.display = 'none';
        if (reviewName) reviewName.value = '';
        if (reviewText) reviewText.value = '';
        showNotification('Спасибо за отзыв!');
      });
    }
  }
}

// ... все остальные функции

// ========== ЗАГРУЗКА JIVOSITE ЧАТА ==========
function loadJivoChat() {
  if (document.querySelector('script[src*="code.jivo.ru"]')) return;
  const script = document.createElement('script');
  script.src = 'https://code.jivo.ru/widget/MpQt52AwnT';   // <-- добавили https:
  script.async = true;
  document.head.appendChild(script);
}
// ========== ЗАПУСК ВСЕГО ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateFavoritesCount();
  initBurgerMenu();
  initFaq();
  initFeatureAnimation();
  initModals();
  initGiftCertificate();
  initReviews();
  loadJivoChat();  // вызов после определения функции
});