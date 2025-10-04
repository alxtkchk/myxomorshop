const cardsContainer = document.getElementById("cards");
const template = document.getElementById("card-template");

function createCard(product) {
  const clone = template.content.cloneNode(true);

  clone.querySelector(".card__img").src = product.image;
  clone.querySelector(".card__title").textContent = product.title;
  clone.querySelector(".card__desc").textContent = product.description;
  clone.querySelector(".card__price").textContent = product.price + " грн";

  // Додаємо кнопку "Buy"
  clone.querySelector(".card__btn").addEventListener("click", () => {
    addToCart(product);
  });

  return clone;
}

function loadProducts() {
  fetch("products.json")
    .then((res) => res.json())
    .then((products) => {
      cardsContainer.innerHTML = ""; // очищаємо контейнер
      products.forEach((product) => {
        const card = createCard(product);
        cardsContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error(err);
      cardsContainer.textContent = "Не вдалося завантажити товари";
    });
}

window.addEventListener("DOMContentLoaded", loadProducts);

const cart = []; // масив для збереження товарів у кошику

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1; // якщо товар вже в кошику – збільшуємо кількість
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

const cartList = document.getElementById("cart-list");

function renderCart() {
  cartList.innerHTML = "";
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.title} - ${item.price} грн x ${item.qty}
      <button class="plus">+</button>
      <button class="minus">-</button>
      <button class="remove">×</button>
    `;

    li.querySelector(".plus").addEventListener("click", () => {
      item.qty += 1;
      renderCart();
    });
    li.querySelector(".minus").addEventListener("click", () => {
      item.qty = Math.max(item.qty - 1, 1);
      renderCart();
    });
    li.querySelector(".remove").addEventListener("click", () => {
      const idx = cart.findIndex((i) => i.id === item.id);
      if (idx !== -1) cart.splice(idx, 1);
      renderCart();
    });

    cartList.appendChild(li);
  });
}

const cartBtn = document.getElementById("btn-cart");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");

cartBtn.addEventListener("click", () => {
  cartModal.classList.remove("hidden");
  renderCart();
});
closeCart.addEventListener("click", () => cartModal.classList.add("hidden"));
