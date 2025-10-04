// Отримуємо контейнер і template
const cardsContainer = document.getElementById("cards");
const template = document.getElementById("card-template");

// Функція для створення картки з template
function createCard(product) {
  const clone = template.content.cloneNode(true);

  clone.querySelector(".card__img").src =
    product.image || "img/placeholder.png";
  clone.querySelector(".card__img").alt = product.title || "Товар";
  clone.querySelector(".card__title").textContent = product.title;
  clone.querySelector(".card__desc").textContent = product.description;
  clone.querySelector(".card__price").textContent = product.price + " грн";

  // Додати обробник на кнопку Buy
  clone.querySelector(".card__btn").addEventListener("click", () => {
    addToCart(product);
  });

  return clone;
}

// Функція завантаження продуктів
function loadProducts() {
  fetch("products.json")
    .then((res) => res.json())
    .then((products) => {
      cardsContainer.innerHTML = "";
      products.forEach((product) => {
        const card = createCard(product);
        cardsContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      cardsContainer.textContent = "Не вдалося завантажити товари.";
    });
}

window.addEventListener("DOMContentLoaded", loadProducts);

// ================== КОШИК ==================
const cartBtn = document.getElementById("btn-cart");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartList = document.getElementById("cart-list");
const cartCount = document.getElementById("cart-count");

// Отримуємо масив з localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Зберігаємо масив у localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Оновлюємо лічильник у хедері
function updateCartCount() {
  const cart = getCart();
  cartCount.textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

// Додаємо товар у кошик
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    product.qty = 1;
    cart.push(product);
  }
  saveCart(cart);
  updateCartCount();
}

// Відображення кошика
function renderCart() {
  const cart = getCart();
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = "<li>Кошик порожній</li>";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * (item.qty || 1);

    const li = document.createElement("li");
    li.className = "cart-item";
    li.dataset.id = item.id;

    li.innerHTML = `
      <span>${item.title}</span>
      <div class="cart-controls">
        <button class="minus">-</button>
        <span class="qty">${item.qty}</span>
        <button class="plus">+</button>
        <span class="price">${item.price} ₴</span>
        <button class="remove">×</button>
      </div>
    `;

    // Події на кнопки плюс, мінус, видалити
    li.querySelector(".plus").addEventListener("click", () => {
      item.qty += 1;
      saveCart(cart);
      renderCart();
      updateCartCount();
    });

    li.querySelector(".minus").addEventListener("click", () => {
      item.qty = Math.max(item.qty - 1, 1);
      saveCart(cart);
      renderCart();
      updateCartCount();
    });

    li.querySelector(".remove").addEventListener("click", () => {
      const idx = cart.findIndex((i) => i.id === item.id);
      if (idx !== -1) cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
      updateCartCount();
    });

    cartList.appendChild(li);
  });

  // Додаємо загальну суму в кінець списку
  const totalLi = document.createElement("li");
  totalLi.style.fontWeight = "bold";
  totalLi.style.marginTop = "10px";
  totalLi.textContent = "Загальна сума: " + total.toFixed(2) + " ₴";
  cartList.appendChild(totalLi);
}

// Відкриття та закриття модалки
cartBtn.onclick = () => {
  renderCart();
  cartModal.classList.remove("hidden");
};
closeCart.onclick = () => cartModal.classList.add("hidden");

// Ініціалізація лічильника при старті
updateCartCount();

// ================== ПРОСТИЙ ПОШУК ==================
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

function filterCards() {
  const filter = searchInput.value.toLowerCase();
  const cards = cardsContainer.querySelectorAll(".card");

  cards.forEach((card) => {
    const titleEl = card.querySelector(".card__title");
    const text = titleEl.textContent.toLowerCase();

    if (text.includes(filter) && filter !== "") {
      // Показуємо картку та підсвічуємо знайдене
      card.style.display = "";
      const regex = new RegExp(`(${filter})`, "gi");
      titleEl.innerHTML = titleEl.textContent.replace(
        regex,
        '<span style="background-color: yellow;">$1</span>'
      );
    } else {
      // Якщо не знайдено, приховуємо картку
      card.style.display = "none";
      titleEl.innerHTML = titleEl.textContent; // відновлюємо текст без підсвічування
    }
  });

  if (filter === "") {
    // Якщо поле порожнє – показуємо всі картки
    cards.forEach((card) => {
      card.style.display = "";
      const titleEl = card.querySelector(".card__title");
      titleEl.innerHTML = titleEl.textContent;
    });
  }
}

// // Пошук по кнопці
// searchBtn.addEventListener("click", filterCards);

// Пошук при наборі тексту (живий пошук)
searchInput.addEventListener("input", filterCards);

// ================== ПРОФІЛЬ ==================
// Отримуємо елементи
const profileBtn = document.getElementById("btn-profile");
const profileModal = document.getElementById("profile-modal");
const closeProfile = document.getElementById("close-profile");
const authForm = document.getElementById("auth-form");
const loginInput = document.getElementById("login-input");
const passwordInput = document.getElementById("password-input");
const profileTitle = document.getElementById("profile-title");
const authBtn = document.getElementById("auth-btn");
const switchMode = document.getElementById("switch-mode");

// Відкриття/закриття модалки
profileBtn.addEventListener("click", () => {
  // Якщо користувач увійшов, пропонуємо вийти
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user) {
    if (confirm(`Вийти з аккаунта ${user.login}?`)) {
      logout();
    }
    return; // не відкривати модалку
  }
  profileModal.classList.remove("hidden");
});

closeProfile.addEventListener("click", () =>
  profileModal.classList.add("hidden")
);

// Простий "логін" або "реєстрація" без сервера (для демо)
authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();

  if (login && password) {
    localStorage.setItem("user", JSON.stringify({ login }));

    profileModal.classList.add("hidden");
    profileBtn.textContent = `Привіт, ${login}`;
    showAlert(
      `Вітаємо, ${login}! Ви успішно ${profileTitle.textContent.toLowerCase()}.`
    );

    // Скидаємо форму
    authForm.reset();
    profileTitle.textContent = "Вхід";
    authBtn.textContent = "Увійти";
    switchMode.textContent = "Зареєструватися";
  } else {
    showAlert("Введіть логін та пароль!");
  }
});

// Вихід
function logout() {
  localStorage.removeItem("user");
  profileBtn.textContent = "Увійти";
}

// При завантаженні сторінки перевіряємо чи користувач "зайшов"
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user) {
    profileBtn.textContent = `Привіт, ${user.login}`;
  }
});

// ================== ЗАМОВЛЕННЯ ==================
// Отримуємо елементи
const orderBtn = document.getElementById("checkout-btn");
const orderModal = document.getElementById("order-modal");
const closeOrder = document.getElementById("close-order");
const orderForm = document.getElementById("order-form");

// Відкриття модалки замовлення
orderBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden"); // ховаємо кошик
  orderModal.classList.remove("hidden"); // показуємо форму замовлення
});

// Закриття модалки
closeOrder.addEventListener("click", () => orderModal.classList.add("hidden"));

// Обробка форми замовлення
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("order-name").value.trim();
  const phone = document.getElementById("order-phone").value.trim();
  const address = document.getElementById("order-address").value.trim();

  if (name && phone && address) {
    showAlert(
      `Дякуємо, ${name}! Ваше замовлення прийнято.\nМи зв'яжемося з вами за номером ${phone}.`
    );

    // Очищаємо кошик після замовлення
    localStorage.removeItem("cart");
    updateCartCount();
    renderCart();

    // Закриваємо модалку
    orderModal.classList.add("hidden");

    // Скидаємо форму
    orderForm.reset();
  } else {
    showAlert("Будь ласка, заповніть всі поля!");
  }
});

const customAlert = document.getElementById("custom-alert");
const alertMessage = document.getElementById("alert-message");
const alertClose = document.getElementById("alert-close");

function showAlert(message, timeout = 3000) {
  alertMessage.textContent = message;
  customAlert.classList.remove("hidden");

  if (timeout) {
    setTimeout(() => {
      customAlert.classList.add("hidden");
    }, timeout);
  }
}

alertClose.addEventListener("click", () => {
  customAlert.classList.add("hidden");
});
