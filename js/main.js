document.addEventListener("DOMContentLoaded", () => {
  initLightbox();
  initPuzzle();
  initRebuses();
  initCrossword();
  initScratchPanel();
  initTinkercadPanel();
  initRouteForms();
  initCurrentAddress();
});

function initLightbox() {
  const triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Закрыть">×</button>
    <div class="lightbox-inner" role="dialog" aria-modal="true">
      <div class="lightbox-image-slot"></div>
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const slot = lightbox.querySelector(".lightbox-image-slot");
  const caption = lightbox.querySelector(".lightbox-caption");
  const close = () => {
    lightbox.classList.remove("open");
    slot.innerHTML = "";
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      slot.innerHTML = "";
      const image = document.createElement("img");
      image.src = trigger.dataset.lightbox;
      image.alt = trigger.dataset.caption || "Фотография";
      slot.appendChild(image);
      caption.textContent = trigger.dataset.caption || "";
      lightbox.classList.add("open");
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initPuzzle() {
  const board = document.querySelector("[data-puzzle-board]");
  if (!board) return;

  const image = board.dataset.image || "photos/photo01.jpg";
  const size = 3;
  let order = Array.from({ length: size * size }, (_, index) => index);
  const status = document.querySelector("[data-puzzle-status]");

  function render() {
    board.innerHTML = "";
    order.forEach((tileIndex, position) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "puzzle-tile";
      tile.setAttribute("aria-label", tileIndex === 8 ? "Пустая клетка" : `Фрагмент ${tileIndex + 1}`);

      if (tileIndex === 8) {
        tile.classList.add("blank");
      } else {
        const col = tileIndex % size;
        const row = Math.floor(tileIndex / size);
        tile.style.backgroundImage = `url("${image}")`;
        tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
        tile.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
      }

      tile.addEventListener("click", () => moveTile(position));
      board.appendChild(tile);
    });
  }

  function moveTile(position) {
    const blank = order.indexOf(8);
    const row = Math.floor(position / size);
    const col = position % size;
    const blankRow = Math.floor(blank / size);
    const blankCol = blank % size;
    const isNeighbor = Math.abs(row - blankRow) + Math.abs(col - blankCol) === 1;
    if (!isNeighbor) return;

    [order[position], order[blank]] = [order[blank], order[position]];
    render();
    updatePuzzleStatus();
  }

  function shuffle() {
    for (let i = 0; i < 90; i += 1) {
      const blank = order.indexOf(8);
      const moves = [blank - 1, blank + 1, blank - size, blank + size].filter((move) => {
        if (move < 0 || move >= order.length) return false;
        const sameRow = Math.floor(move / size) === Math.floor(blank / size);
        return Math.abs(move - blank) === size || sameRow;
      });
      const next = moves[Math.floor(Math.random() * moves.length)];
      [order[next], order[blank]] = [order[blank], order[next]];
    }
    render();
    if (status) status.textContent = "Пазл перемешан.";
  }

  function updatePuzzleStatus() {
    if (!status) return;
    const solved = order.every((value, index) => value === index);
    status.textContent = solved ? "Готово: фотография собрана." : "";
  }

  document.querySelector("[data-puzzle-shuffle]")?.addEventListener("click", shuffle);
  document.querySelector("[data-puzzle-reset]")?.addEventListener("click", () => {
    order = Array.from({ length: size * size }, (_, index) => index);
    render();
    if (status) status.textContent = "Пазл возвращен в исходное состояние.";
  });

  render();
}

function initRebuses() {
  document.querySelectorAll("[data-rebus]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const answer = normalize(form.dataset.answer || "");
      const input = form.querySelector("input");
      const status = form.querySelector(".rebus-status");
      const value = normalize(input.value);
      if (!status) return;
      status.textContent = value === answer ? "Верно." : "Попробуйте еще раз.";
      status.style.color = value === answer ? "var(--green-dark)" : "var(--brick-dark)";
    });
  });
}

function initCrossword() {
  const grid = document.querySelector("#crosswordGrid");
  if (!grid) return;

  const words = [
    { number: 1, answer: "ЭКСПОЗИЦИЯ", row: 4, col: 2, dir: "across", clue: "Размещение произведений искусства в залах." },
    { number: 2, answer: "ЭКСКУРСИЯ", row: 4, col: 2, dir: "down", clue: "Посещение с рассказом экскурсовода." },
    { number: 3, answer: "МУЗЕЙ", row: 2, col: 7, dir: "down", clue: "Учреждение, где сохраняют и показывают коллекции." },
    { number: 4, answer: "ГАЛЕРЕЯ", row: 5, col: 4, dir: "across", clue: "Место, где выставляют картины." },
    { number: 5, answer: "КУЛЬТУРА", row: 8, col: 1, dir: "across", clue: "Духовные и материальные ценности общества." },
    { number: 6, answer: "ТАМБОВ", row: 8, col: 5, dir: "down", clue: "Город, где находится областная картинная галерея." },
    { number: 7, answer: "КАРТИНА", row: 9, col: 4, dir: "across", clue: "Произведение живописи." },
    { number: 8, answer: "ХУДОЖНИК", row: 0, col: 0, dir: "across", clue: "Автор картины." }
  ];

  const rows = 14;
  const cols = 13;
  const cells = new Map();
  const starts = new Map();

  words.forEach((word) => {
    starts.set(`${word.row}:${word.col}`, [...(starts.get(`${word.row}:${word.col}`) || []), word.number]);
    [...word.answer].forEach((letter, index) => {
      const row = word.row + (word.dir === "down" ? index : 0);
      const col = word.col + (word.dir === "across" ? index : 0);
      const key = `${row}:${col}`;
      cells.set(key, letter);
    });
  });

  grid.style.gridTemplateColumns = `repeat(${cols}, 34px)`;
  grid.innerHTML = "";

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const key = `${row}:${col}`;
      const cell = document.createElement("div");
      cell.className = "crossword-cell";

      if (!cells.has(key)) {
        cell.classList.add("empty");
        grid.appendChild(cell);
        continue;
      }

      const numbers = starts.get(key);
      if (numbers) {
        const mark = document.createElement("span");
        mark.className = "cell-number";
        mark.textContent = numbers.join("/");
        cell.appendChild(mark);
      }

      const input = document.createElement("input");
      input.maxLength = 1;
      input.autocomplete = "off";
      input.dataset.answer = cells.get(key);
      input.setAttribute("aria-label", `Клетка ${row + 1}-${col + 1}`);
      input.addEventListener("input", () => {
        input.value = normalize(input.value).slice(0, 1);
        input.classList.remove("correct", "wrong");
      });
      cell.appendChild(input);
      grid.appendChild(cell);
    }
  }

  const clues = document.querySelector("#crosswordClues");
  if (clues) {
    clues.innerHTML = words.map((word) => `<li><strong>${word.number}.</strong> ${word.clue}</li>`).join("");
  }

  const status = document.querySelector("[data-crossword-status]");
  document.querySelector("[data-crossword-check]")?.addEventListener("click", () => {
    let correct = 0;
    const inputs = grid.querySelectorAll("input");
    inputs.forEach((input) => {
      const ok = normalize(input.value) === input.dataset.answer;
      input.classList.toggle("correct", ok);
      input.classList.toggle("wrong", !ok && input.value.length > 0);
      if (ok) correct += 1;
    });
    if (status) status.textContent = `Правильно заполнено клеток: ${correct} из ${inputs.length}.`;
  });

  document.querySelector("[data-crossword-clear]")?.addEventListener("click", () => {
    grid.querySelectorAll("input").forEach((input) => {
      input.value = "";
      input.classList.remove("correct", "wrong");
    });
    if (status) status.textContent = "Кроссворд очищен.";
  });
}

function initScratchPanel() {
  const panel = document.querySelector("[data-scratch-panel]");
  if (!panel) return;

  const scenes = [
    "Сцена 1: студенты подходят к входу галереи.",
    "Сцена 2: группа выбирает зал с живописью.",
    "Сцена 3: после просмотра участники делятся впечатлениями."
  ];
  let index = 0;
  const label = panel.querySelector("[data-scratch-label]");
  const button = panel.querySelector("[data-scratch-next]");
  const character = panel.querySelector(".scratch-character");

  function updateScene() {
    if (label) label.textContent = scenes[index];
    if (character) character.style.left = `${34 + index * 72}px`;
  }

  button?.addEventListener("click", () => {
    index = (index + 1) % scenes.length;
    updateScene();
  });
  updateScene();
}

function initTinkercadPanel() {
  const range = document.querySelector("[data-model-rotate]");
  const model = document.querySelector(".model-building");
  const value = document.querySelector("[data-model-value]");
  if (!range || !model) return;

  const update = () => {
    model.style.setProperty("--model-angle", `${range.value}deg`);
    if (value) value.textContent = `${range.value}°`;
  };
  range.addEventListener("input", update);
  update();
}

function initRouteForms() {
  document.querySelectorAll("[data-route-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      const service = event.submitter?.dataset.service || "google";
      const origin = encodeURIComponent(input.value.trim());
      const destination = encodeURIComponent("Тамбовская областная картинная галерея, Тамбов, Советская 97");

      if (!origin) {
        input.focus();
        return;
      }

      const url = service === "yandex"
        ? `https://yandex.ru/maps/?rtext=${origin}~52.724639,41.455975&rtt=pd`
        : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
      window.open(url, "_blank", "noopener");
    });
  });
}

function initCurrentAddress() {
  const target = document.querySelector("[data-current-url]");
  if (!target) return;
  target.textContent = window.location.href;
}

function normalize(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(/ё/g, "е")
    .replace(/Ё/g, "Е")
    .toUpperCase();
}
