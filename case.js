document.addEventListener("DOMContentLoaded", () => {
    const caseTitle = document.getElementById("case-title");
    const caseImage = document.getElementById("case-image");
    const caseItemsContainer = document.querySelector(".case-items");
    const rouletteContainer = document.querySelector(".case-roulette");
    const rouletteWrapper = document.querySelector(".roulette-wrapper");
    const dropResult = document.querySelector(".drop-result");
    const dropResultContainer = document.querySelector(".case-drop-result");
    const openCaseButton = document.getElementById("open-case");
    const openButtonWrapper = document.querySelector(".open-button-wrapper");
    const caseContainer = document.querySelector(".case-container");
    const balanceDisplay = document.getElementById("balance-amount");

    let inventoryData = {};


    if (localStorage.getItem("userBalance") === null) {
        localStorage.setItem("userBalance", "1000");
    }

    let balance = parseFloat(localStorage.getItem("userBalance"));
    updateBalanceDisplay();

    const urlParams = new URLSearchParams(window.location.search);
    const caseType = urlParams.get("type");
    const storageKey = `generatedItems-${caseType}`;

    caseImage.src = `images/${caseType}-logo.png`;

    const caseOpenPrices = {
        free1: 0,
        free2: 0,
        armeiskoe: 50,
        zapreshennoe: 100,
        zasecrechennoe: 300,
        tainoe: 600,
        nozh: 13000,
        perchatki: 15000
    };

    const priceRanges = {
        free1: { min: 0, max: 10 },
        free2: { min: 0, max: 20 },
        armeiskoe: { min: 10, max: 65 },
        zapreshennoe: { min: 65, max: 120 },
        zasecrechennoe: { min: 180, max: 350 },
        tainoe: { min: 300, max: 800 },
        nozh: { min: 8000, max: 16000 },
        perchatki: { min: 10000, max: 19000 }
    };

    function updateBalanceDisplay() {
        balanceDisplay.textContent = `\u00A0${balance.toFixed(2)}  ₽`;
        localStorage.setItem("userBalance", balance);
    }

    function calculateItemPrice(caseType) {
        const range = priceRanges[caseType];
        if (!range) return Math.random() * 100 + 10;
        return Math.random() * (range.max - range.min) + range.min;
    }

    function getRandomItem(i) {
        const actualCaseType = caseType;
        const fileName = `${i}.png`;
        const itemData = inventoryData?.[actualCaseType]?.[fileName];
        const fullName = itemData?.name || `Предмет ${i}`;
        const [model, skin] = fullName.split(" | ");

        const price = calculateItemPrice(caseType);
        return {
            src: `new_images_numbers/${actualCaseType}/${fileName}`,
            name: fullName,
            model: model || fullName,
            skin: skin || "",
            price: `${price.toFixed(2)} ₽`,
            rawPrice: price,
            className: actualCaseType
        };
    }

    function loadCaseItems() {
        caseItemsContainer.innerHTML = "";
        let items;

        if (localStorage.getItem(storageKey)) {
            items = JSON.parse(localStorage.getItem(storageKey));
        } else {
            items = Array.from({ length: 20 }, (_, i) => getRandomItem(i + 1));
            localStorage.setItem(storageKey, JSON.stringify(items));
        }

        items.sort((a, b) => b.rawPrice - a.rawPrice).forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("case-item", caseType);


            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.name;
            img.onerror = function () {
                this.style.display = 'none';
            };

            const priceTag = document.createElement("p");
            priceTag.classList.add("price-tag");
            priceTag.textContent = item.price;

            const modelDiv = document.createElement("div");
            modelDiv.className = "item-model";
            modelDiv.textContent = item.model;

            const skinDiv = document.createElement("div");
            skinDiv.className = "item-skin";
            skinDiv.textContent = item.skin;

            itemDiv.appendChild(img);
            itemDiv.appendChild(modelDiv);
            itemDiv.appendChild(skinDiv);
            itemDiv.appendChild(priceTag);

            caseItemsContainer.appendChild(itemDiv);
        });
    }

    function startRoulette() {
        const openCost = caseOpenPrices[caseType] ?? 0;

        if (openCost > balance) {
            showNotification("Недостаточно средств для открытия кейса!");
            return;
        }
        balance -= openCost;
        updateBalanceDisplay();

        openButtonWrapper.style.transition = "height 0.4s ease, opacity 0.3s ease";
        caseImage.style.transition = "height 0.4s ease, opacity 0.3s ease";

        const buttonHeight = openButtonWrapper.offsetHeight;
        const imageHeight = caseImage.offsetHeight;

        openButtonWrapper.style.height = `${buttonHeight}px`;
        caseImage.style.height = `${imageHeight}px`;

        requestAnimationFrame(() => {
            openButtonWrapper.style.height = "0";
            openButtonWrapper.style.opacity = "0";
            openButtonWrapper.style.margin = "0";
            openButtonWrapper.style.padding = "0";

            caseImage.style.height = "0";
            caseImage.style.opacity = "0";
            caseImage.style.margin = "0";
        });

        setTimeout(() => {
            openButtonWrapper.remove();
            caseImage.remove();

            rouletteWrapper.style.display = "block";
            rouletteWrapper.style.opacity = "0";
            rouletteWrapper.style.transform = "translateY(20px)";
            rouletteWrapper.style.transition = "opacity 0.4s ease, transform 0.4s ease";

            requestAnimationFrame(() => {
                rouletteWrapper.style.opacity = "1";
                rouletteWrapper.style.transform = "translateY(0)";
                setTimeout(() => animateRoulette(), 100);
            });
        }, 400);
    }

    function animateRoulette() {
        rouletteContainer.innerHTML = "";
        dropResultContainer.style.opacity = "0";

        const items = JSON.parse(localStorage.getItem(storageKey));
        const winningItem = items[Math.floor(Math.random() * items.length)];

        const lastSaved = localStorage.getItem("lastDropSaved");
        if (lastSaved !== winningItem.src) {
            const inventory = JSON.parse(localStorage.getItem("userInventory")) || [];
            inventory.push({
                ...winningItem,
                className: winningItem.className || caseType
            });
            localStorage.setItem("userInventory", JSON.stringify(inventory));
            localStorage.setItem("lastDropSaved", winningItem.src);
        }

        const rouletteSequence = [
            ...Array.from({ length: 38 }, () => items[Math.floor(Math.random() * items.length)]),
            winningItem,
            ...Array.from({ length: 18 }, () => items[Math.floor(Math.random() * items.length)])
        ];

        rouletteSequence.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.className = "roulette-item";
            itemElement.innerHTML = `<img src="${item.src}" alt="${item.name}">`;
            rouletteContainer.appendChild(itemElement);
        });

        const itemWidth = 110;
        const centerIndex = Math.floor(7 / 2);
        const targetPosition = (40 - centerIndex) * itemWidth;

        requestAnimationFrame(() => {
            rouletteContainer.style.transition = "none";
            rouletteContainer.style.transform = "translateX(0)";

            requestAnimationFrame(() => {
                rouletteContainer.style.transition = "transform 3.5s cubic-bezier(0.2, 0.8, 0.4, 1)";
                rouletteContainer.style.transform = `translateX(-${targetPosition}px)`;
            });
        });

        setTimeout(() => {
            const resultImg = dropResult.querySelector("img");
            const resultModel = dropResult.querySelector(".item-model strong");
            const resultSkin = dropResult.querySelector(".item-skin");
            const resultPrice = dropResult.querySelector(".item-price");

            resultImg.src = winningItem.src;
            resultImg.alt = winningItem.name;
            resultModel.textContent = winningItem.model;
            resultSkin.textContent = winningItem.skin;
            resultPrice.textContent = winningItem.price;

            dropResult.style.display = "block";
            dropResultContainer.style.opacity = "1";

            dropResult.querySelector(".open-again").onclick = () => {
                localStorage.removeItem(storageKey);
                localStorage.removeItem("lastDropSaved"); // ❗ Сброс чтобы новый дроп сохранить
                location.reload();
            };

            dropResult.querySelector(".sell").onclick = () => {
                const inventory = JSON.parse(localStorage.getItem("userInventory")) || [];
                const updatedInventory = inventory.filter(item => item.src !== winningItem.src);
                localStorage.setItem("userInventory", JSON.stringify(updatedInventory));

                balance += winningItem.rawPrice;
                updateBalanceDisplay();
                showNotification(`Предмет "${winningItem.name}" продан за ${winningItem.price}`);
                setTimeout(() => location.reload(), 1500);
            };

            dropResult.querySelector(".save").onclick = () => {
                showNotification(`"${winningItem.name}" уже добавлен в инвентарь`);
                setTimeout(() => location.reload(), 1500);
            };

        }, 3800);
    }

    fetch("inventory.json")
        .then(res => res.json())
        .then(data => {
            inventoryData = data;
            loadCaseItems();
        });

    rouletteWrapper.style.display = "none";
    openCaseButton.addEventListener("click", startRoulette);
});

function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
        notification.style.display = "none";
    }, 2000);
}
