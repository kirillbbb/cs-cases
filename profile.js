document.addEventListener("DOMContentLoaded", () => {
    const balanceDisplay = document.querySelector(".balance-amount");
    const inventoryGrid = document.querySelector(".inventory-grid");
    const topupButton = document.querySelector(".topup-btn");

    let balance = parseFloat(localStorage.getItem("userBalance")) || 0;
    const inventory = JSON.parse(localStorage.getItem("userInventory")) || [];

    function updateBalanceDisplay() {
        balanceDisplay.textContent = `${balance.toFixed(2)} ₽`;
        localStorage.setItem("userBalance", balance.toFixed(2));
    }

    function saveInventory() {
        localStorage.setItem("userInventory", JSON.stringify(inventory));
    }

    function showNotification(message) {
        const notification = document.getElementById("notification");
        notification.textContent = message;
        notification.style.display = "block";

        setTimeout(() => {
            notification.style.display = "none";
        }, 2000);
    }

    function renderInventory() {
        inventoryGrid.innerHTML = "";

        if (inventory.length === 0) {
            inventoryGrid.classList.add("empty");
            inventoryGrid.innerHTML = `<p class="empty-text">У вас пока нет предметов</p>`;
            return;
        }

        inventoryGrid.classList.remove("empty");

        inventory.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("inventory-item", item.className || "armeiskoe");

            itemDiv.innerHTML = `
                <img src="${item.src}" alt="${item.name}">
                <div class="item-info">
                    <div class="item-model">${item.model}</div>
                    <div class="item-skin">${item.skin}</div>
                    <div class="item-price">${item.price}</div>
                </div>
                <button class="sell-btn">Продать</button>
            `;

            itemDiv.querySelector(".sell-btn").addEventListener("click", () => {
                balance += item.rawPrice;
                updateBalanceDisplay();
                inventory.splice(index, 1);
                saveInventory();
                renderInventory();
            });

            inventoryGrid.appendChild(itemDiv);
        });
    }

    topupButton.addEventListener("click", () => {
        balance += 500;
        updateBalanceDisplay();
        showNotification("+1000 ₽ добавлено на баланс");
    });

    updateBalanceDisplay();
    renderInventory();
});
