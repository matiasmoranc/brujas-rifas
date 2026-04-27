import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";



const firebaseConfig = {
  apiKey: "AIzaSyDZStiJ5oW3dDg2GlZZKx0_zaPXSb9tUPo",
  authDomain: "rifa-numeros.firebaseapp.com",
  projectId: "rifa-numeros",
  storageBucket: "rifa-numeros.firebasestorage.app",
  messagingSenderId: "647113234061",
  appId: "1:647113234061:web:1543429903948ce70a74c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TOTAL_NUMBERS = 100;
const downloadImageBtn = document.getElementById("downloadImageBtn");
const numbersGrid = document.getElementById("numbersGrid");
const modal = document.getElementById("modal");
const selectedNumberText = document.getElementById("selectedNumber");

const buyerName = document.getElementById("buyerName");
const buyerLastName = document.getElementById("buyerLastName");
const buyerPhone = document.getElementById("buyerPhone");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const soldCount = document.getElementById("soldCount");
const availableCount = document.getElementById("availableCount");
const soldList = document.getElementById("soldList");

let selectedNumber = null;
let soldNumbers = {};

function renderNumbers() {
  numbersGrid.innerHTML = "";

  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
    const button = document.createElement("button");
    button.classList.add("number");
    button.textContent = i;

    if (soldNumbers[i]) {
      button.classList.add("sold");
      button.title = `${soldNumbers[i].nombre} ${soldNumbers[i].apellido} - ${soldNumbers[i].telefono}`;

      button.addEventListener("click", async () => {
        const confirmCancel = confirm(
          `¿Seguro que querés cancelar la venta del número ${i}?\n\nComprador: ${soldNumbers[i].nombre} ${soldNumbers[i].apellido}\nTeléfono: ${soldNumbers[i].telefono}`
        );

        if (!confirmCancel) return;

        await deleteDoc(doc(db, "rifa", String(i)));
      });
    } else {
      button.addEventListener("click", () => openModal(i));
    }

    numbersGrid.appendChild(button);
  }

  const totalSold = Object.keys(soldNumbers).length;
  soldCount.textContent = totalSold;
  availableCount.textContent = TOTAL_NUMBERS - totalSold;
}

function renderSoldList() {
  soldList.innerHTML = "";

  const soldArray = Object.values(soldNumbers).sort((a, b) => a.numero - b.numero);

  if (soldArray.length === 0) {
    soldList.innerHTML = `<p class="empty-list">Todavía no hay números vendidos.</p>`;
    return;
  }

  soldArray.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("sold-item");

    div.innerHTML = `
      <div class="sold-info">
        <strong>Número ${item.numero}</strong>
        ${item.nombre} ${item.apellido} - ${item.telefono}
      </div>
      <button class="cancel-sale" data-number="${item.numero}">
        Cancelar
      </button>
    `;

    soldList.appendChild(div);
  });

  document.querySelectorAll(".cancel-sale").forEach((button) => {
    button.addEventListener("click", async () => {
      const number = button.dataset.number;
      const item = soldNumbers[number];

      const confirmCancel = confirm(
        `¿Seguro que querés cancelar la venta del número ${number}?\n\nComprador: ${item.nombre} ${item.apellido}\nTeléfono: ${item.telefono}`
      );

      if (!confirmCancel) return;

      await deleteDoc(doc(db, "rifa", String(number)));
    });
  });
}

function openModal(number) {
  selectedNumber = number;
  selectedNumberText.textContent = number;

  buyerName.value = "";
  buyerLastName.value = "";
  buyerPhone.value = "";

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  selectedNumber = null;
}

async function saveNumber() {
  const nombre = buyerName.value.trim();
  const apellido = buyerLastName.value.trim();
  const telefono = buyerPhone.value.trim();

  if (!nombre || !apellido || !telefono) {
    alert("Completá nombre, apellido y teléfono.");
    return;
  }

  if (!selectedNumber) return;

  await setDoc(doc(db, "rifa", String(selectedNumber)), {
    numero: selectedNumber,
    vendido: true,
    nombre,
    apellido,
    telefono,
    fecha: serverTimestamp()
  });

  closeModal();
}

onSnapshot(collection(db, "rifa"), (snapshot) => {
  soldNumbers = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    if (data.vendido) {
      soldNumbers[data.numero] = data;
    }
  });

  renderNumbers();
  renderSoldList();
});

saveBtn.addEventListener("click", saveNumber);
cancelBtn.addEventListener("click", closeModal);

downloadImageBtn.addEventListener("click", async () => {
  const gridElement = document.getElementById("numbersGrid");

  const canvas = await html2canvas(gridElement, {
    backgroundColor: "#f4f4f4",
    scale: 2
  });

  const image = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = image;
  link.download = "numeros-vendidos-rifa.png";
  link.click();
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});