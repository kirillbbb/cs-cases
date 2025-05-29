document.addEventListener("DOMContentLoaded", () => {
    const lentaTrack = document.querySelector(".lenta-track");
    const screenWidth = window.innerWidth;
    const itemSize = screenWidth * 0.065;
    const itemsCount = Math.floor(screenWidth / (itemSize + 15));
    const balanceSpan = document.getElementById("balance-amount");
    const storedBalance = parseFloat(localStorage.getItem("userBalance")) || 0;
    balanceSpan.textContent = `\u00A0${storedBalance.toFixed(2)} ₽`;
    const folderChances = [
        { name: "armeiskoe", chance: 45 },
        { name: "zasecrechennoe", chance: 25 },
        { name: "zapreshennoe", chance: 15 },
        { name: "tainoe", chance: 10 },
        { name: "perchatki", chance: 1 },
        { name: "nozh", chance: 4 }
    ];

    let inventoryData = {};

    fetch("inventory.json")
        .then(res => res.json())
        .then(data => {
            inventoryData = data;
            createLentaItems();
            setInterval(shiftItems, 3000);
        });

    function parseItemName(fullName) {
        const [model, skin] = fullName.split(" | ");
        return {
            model: model || "",
            skin: skin || ""
        };
    }

    function getRandomImage() {
        const randomNum = Math.random() * 100;
        let cumulativeChance = 0;

        for (const folder of folderChances) {
            cumulativeChance += folder.chance;
            if (randomNum <= cumulativeChance) {
                const imageNumber = Math.floor(Math.random() * 20) + 1;
                const fileName = `${imageNumber}.png`;
                const itemData = inventoryData[folder.name]?.[fileName];

                return {
                    src: `new_images_numbers/${folder.name}/${fileName}`,
                    className: folder.name,
                    name: itemData?.name || ""
                };
            }
        }
    }

    function createItemElement(itemData) {
        const item = document.createElement("div");
        item.classList.add("lenta-item", itemData.className);

        const img = document.createElement("img");
        img.src = itemData.src;
        item.appendChild(img);

        if (itemData.name) {
            const { model, skin } = parseItemName(itemData.name);

            const modelDiv = document.createElement("div");
            modelDiv.className = "item-model";
            modelDiv.textContent = model;

            const skinDiv = document.createElement("div");
            skinDiv.className = "item-skin";
            skinDiv.textContent = skin;

            item.appendChild(modelDiv);
            item.appendChild(skinDiv);
        }

        return item;
    }

    function createLentaItems() {
        lentaTrack.innerHTML = "";
        for (let i = 0; i < itemsCount; i++) {
            const itemData = getRandomImage();
            const item = createItemElement(itemData);
            lentaTrack.appendChild(item);
        }
    }

    function shiftItems() {
        const items = document.querySelectorAll(".lenta-item");
        const newImage = getRandomImage();
        const shiftDistance = items[0].offsetWidth + 15;

        lentaTrack.style.transform = `translateX(${shiftDistance}px)`;

        setTimeout(() => {
            const newItem = createItemElement(newImage);
            lentaTrack.prepend(newItem);

            lentaTrack.style.transition = "none";
            lentaTrack.style.transform = "translateX(0)";
            items[items.length - 1].remove();

            setTimeout(() => {
                lentaTrack.style.transition = "transform 1.5s cubic-bezier(0.25, 1, 0.5, 1)";
            }, 50);
        }, 1100);
    }
});
