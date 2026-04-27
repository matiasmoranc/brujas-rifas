import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 
  Pegá acá tu configuración de Firebase.
*/
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
      button.disabled = true;
    } else {
      button.addEventListener("click", () => openModal(i));
    }

    numbersGrid.appendChild(button);
  }

  const totalSold = Object.keys(soldNumbers).length;
  soldCount.textContent = totalSold;
  availableCount.textContent = TOTAL_NUMBERS - totalSold;
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

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.vendido) {
      soldNumbers[data.numero] = data;
    }
  });

  renderNumbers();
});

saveBtn.addEventListener("click", saveNumber);
cancelBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});