
const whatsappNumber = "962778001799";

const cart = new Map();
const favorites = new Set();

const cards = document.querySelectorAll(".product-card");

const searchInput = document.getElementById("productSearch");
const searchMessage = document.getElementById("searchMessage");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
            const productName =
                card.querySelector("h3")?.textContent.toLowerCase() || "";

            const productDescription =
                card.querySelector(".product-info p")?.textContent.toLowerCase() || "";

            const matches =
                productName.includes(query) ||
                productDescription.includes(query);

            card.hidden = !matches;

            if (matches) visibleCount++;
        });

        if (searchMessage) {
            searchMessage.textContent =
                query && visibleCount === 0
                    ? "ما لقينا منتج بهذا الاسم، جرّبي كلمة ثانية 🌷"
                    : query
                        ? `لقينا ${visibleCount} منتج`
                        : "";
        }
    });
}

// إنشاء زر القلب وزر إضافة للسلة لكل منتج
cards.forEach((card, index) => {
    const oldOrderButton = card.querySelector(".order-button");

    if (!oldOrderButton) return;

    const name =
        oldOrderButton.dataset.product ||
        card.querySelector("h3")?.textContent.trim() ||
        `منتج ${index + 1}`;

    const priceText =
        oldOrderButton.dataset.price ||
        card.querySelector(".price")?.textContent ||
        "0";

    const price = Number(
        priceText.replace(/[^\d.]/g, "")
    ) || 0;

    oldOrderButton.addEventListener("click", () => {
        const message =
            `مرحباً، أريد طلب ${name}. السعر: ${price} دينار أردني.`;

        const whatsappURL =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");
    });

    const favoriteButton = document.createElement("button");
    favoriteButton.className = "favorite-button";
    favoriteButton.type = "button";
    favoriteButton.textContent = "♡";
    favoriteButton.setAttribute("aria-label", "إضافة للمفضلة");

    favoriteButton.addEventListener("click", () => {
        if (favorites.has(index)) {
            favorites.delete(index);
            favoriteButton.classList.remove("active");
            favoriteButton.textContent = "♡";
        } else {
            favorites.add(index);
            favoriteButton.classList.add("active");
            favoriteButton.textContent = "♥";
        }
    });

    card.appendChild(favoriteButton);

    const addButton = document.createElement("button");
    addButton.className = "add-cart-button";
    addButton.type = "button";
    addButton.textContent = "＋ أضيفي إلى السلة";

    addButton.addEventListener("click", () => {
        const item = cart.get(index) || {
            name,
            price,
            quantity: 0
        };

        item.quantity++;
        cart.set(index, item);
        updateCartCount();

        addButton.textContent = "✓ تمت الإضافة";
        setTimeout(() => {
            addButton.textContent = "＋ أضيفي إلى السلة";
        }, 1000);
    });

    // نخلي زر الطلب الأصلي موجوداً
    oldOrderButton.insertAdjacentElement("afterend", addButton);
});

// إنشاء زر السلة
const cartPanel = document.createElement("button");
cartPanel.className = "cart-panel";
cartPanel.type = "button";
cartPanel.innerHTML =
    '🛍️ السلة <span class="cart-count">0</span>';

document.body.appendChild(cartPanel);

// نافذة تفاصيل السلة
const dialog = document.createElement("div");
dialog.className = "cart-dialog";

dialog.innerHTML = `
    <div class="cart-content" dir="rtl">
        <h2>سلة مشترياتك 🛍️</h2>
        <div class="cart-items"></div>
        <div class="cart-total"></div>
        <div class="cart-actions">
            <button type="button" class="checkout-button">
                إكمال الطلب عبر واتساب
            </button>
            <button type="button" class="close-cart">
                إغلاق
            </button>
        </div>
    </div>
`;

document.body.appendChild(dialog);

function updateCartCount() {
    const count = [...cart.values()].reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartPanel.querySelector(".cart-count").textContent = count;
}

function renderCart() {
    const itemsContainer = dialog.querySelector(".cart-items");
    const totalElement = dialog.querySelector(".cart-total");

    itemsContainer.innerHTML = "";

    let total = 0;

    if (cart.size === 0) {
        itemsContainer.textContent = "السلة فارغة حالياً 🌷";
    }

    cart.forEach((item, id) => {
        total += item.price * item.quantity;

        const row = document.createElement("div");
        row.className = "cart-row";

        const description = document.createElement("span");
        description.textContent =
            `${item.name} — ${item.price} د.أ × ${item.quantity}`;

        const controls = document.createElement("div");

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.setAttribute("aria-label", "تقليل الكمية");

        minus.addEventListener("click", () => {
            item.quantity--;

            if (item.quantity <= 0) {
                cart.delete(id);
            }

            updateCartCount();
            renderCart();
        });

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute("aria-label", "زيادة الكمية");

        plus.addEventListener("click", () => {
            item.quantity++;
            updateCartCount();
            renderCart();
        });

        controls.append(minus, plus);
        row.append(description, controls);
        itemsContainer.appendChild(row);
    });

    totalElement.textContent = `المجموع: ${total.toFixed(2)} دينار أردني`;
}

cartPanel.addEventListener("click", () => {
    renderCart();
    dialog.classList.add("open");
});

dialog.querySelector(".close-cart").addEventListener("click", () => {
    dialog.classList.remove("open");
});

dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
        dialog.classList.remove("open");
    }
});

dialog.querySelector(".checkout-button").addEventListener("click", () => {
    if (cart.size === 0) {
        alert("أضيفي منتجاً إلى السلة أولاً 🌷");
        return;
    }

    let message = "مرحباً، أريد طلب المنتجات التالية:\n\n";
    let total = 0;

    cart.forEach((item) => {
        message +=
            `• ${item.name} — ${item.quantity} × ${item.price} د.أ\n`;

        total += item.price * item.quantity;
    });

    message += `\nالمجموع: ${total.toFixed(2)} دينار أردني`;

    const url =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
});

/* ===== نموذج تقييمات الزبونات ===== */
const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");
const reviewMessage = document.getElementById("reviewMessage");

if (reviewForm && reviewsList && reviewMessage) {
    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("reviewName").value.trim();
        const text = document.getElementById("reviewText").value.trim();
        const ratingInput = reviewForm.querySelector(
            'input[name="rating"]:checked'
        );

        if (!name || !text || !ratingInput) {
            reviewMessage.textContent = "يرجى تعبئة الاسم والتقييم والرأي 🌷";
            return;
        }

        const rating = Number(ratingInput.value);

        const card = document.createElement("article");
        card.className = "review-card";

        const stars = document.createElement("div");
        stars.className = "review-stars";
        stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
        stars.setAttribute("aria-label", `تقييم ${rating} من 5`);

        const reviewText = document.createElement("p");
        reviewText.className = "review-text";
        reviewText.textContent = text;

        const reviewer = document.createElement("h3");
        reviewer.className = "review-name";
        reviewer.textContent = name;

        card.append(stars, reviewText, reviewer);
        reviewsList.prepend(card);

        reviewForm.reset();
        reviewMessage.textContent =
            "شكرًا لمشاركتنا رأيكِ! ظهر التقييم في هذه الصفحة.";

    });
}
