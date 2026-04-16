/* =========================
   DRAG START (LEFT PANEL)
========================= */
const elements = document.querySelectorAll('.element');

elements.forEach(el => {
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('type', el.dataset.type);
  });
});

/* =========================
   MAIN SYSTEM
========================= */
const canvas = document.getElementById('dropZone');
const panel = document.getElementById('propertiesPanel');
const layersList = document.getElementById('layersList');

let selectedEl = null;

/* =========================
   DRAG OVER
========================= */
canvas.addEventListener('dragover', (e) => e.preventDefault());

/* =========================
   DROP (ONLY ONE CLEAN)
========================= */
canvas.addEventListener('drop', (e) => {
  e.preventDefault();

  const type = e.dataTransfer.getData('type');

  const el = document.createElement('div');
  el.className = 'canvas-item';

  el.style.left = e.offsetX + 'px';
  el.style.top = e.offsetY + 'px';

  if (type === 'text') el.innerText = "Text";
  if (type === 'button') el.innerHTML = "<button class='btn'>Button</button>";
  if (type === 'image') el.innerHTML = "<img src='https://picsum.photos/120'>";
  if (type === 'container') el.innerText = "Container";
  if (type === 'card') el.innerHTML = "<div class='card glass'>Card</div>";
  if (type === 'form') el.innerHTML = "<input placeholder='Input'><button class='btn'>Submit</button>";

  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  el.appendChild(handle);

  canvas.appendChild(el);

  makeDraggable(el);
  makeResizable(el, handle);
  attachSelection(el);

  updateLayers(); // ✅ FIXED
});

/* =========================
   SELECT
========================= */
function attachSelection(el) {
  el.addEventListener('click', (e) => {
    e.stopPropagation();

    document.querySelectorAll('.canvas-item')
      .forEach(i => i.classList.remove('selected'));

    el.classList.add('selected');
    selectedEl = el;

    panel.classList.add('active');
    loadProperties();

    highlightLayer(el);
  });
}

/* =========================
   DESELECT
========================= */
canvas.addEventListener('click', (e) => {
  if (e.target === canvas) {
    document.querySelectorAll('.canvas-item')
      .forEach(i => i.classList.remove('selected'));

    selectedEl = null;
    panel.classList.remove('active');
    clearLayerHighlight();
  }
});

/* =========================
   DELETE
========================= */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete' && selectedEl) {
    selectedEl.remove();
    selectedEl = null;
    panel.classList.remove('active');
    updateLayers(); // ✅ FIXED
  }
});

/* =========================
   DRAG MOVE
========================= */
function makeDraggable(el) {
  let isDragging = false, offsetX, offsetY;

  el.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    el.style.left = (e.pageX - canvas.offsetLeft - offsetX) + 'px';
    el.style.top = (e.pageY - canvas.offsetTop - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

/* =========================
   RESIZE
========================= */
function makeResizable(el, handle) {
  let isResizing = false;

  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isResizing = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    el.style.width = e.offsetX + 'px';
    el.style.height = e.offsetY + 'px';
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}

/* =========================
   SMART TARGET
========================= */
function getTarget(el) {
  return el.querySelector('button, img, input, textarea, div') || el;
}

/* =========================
   LOAD PROPERTIES
========================= */
function loadProperties() {
  if (!selectedEl) return;

  const t = getTarget(selectedEl);
  const s = getComputedStyle(t);

  propWidth.value = selectedEl.offsetWidth;
  propHeight.value = selectedEl.offsetHeight;
  propPadding.value = parseInt(s.padding) || 0;
  propRadius.value = parseInt(s.borderRadius) || 0;
  propFont.value = parseInt(s.fontSize) || 14;
  propOpacity.value = s.opacity || 1;
}

/* =========================
   APPLY PROPERTIES
========================= */
propWidth.oninput = e => selectedEl && (selectedEl.style.width = e.target.value + 'px');
propHeight.oninput = e => selectedEl && (selectedEl.style.height = e.target.value + 'px');

propPadding.oninput = e => {
  if (!selectedEl) return;
  getTarget(selectedEl).style.padding = e.target.value + 'px';
};

propRadius.oninput = e => {
  if (!selectedEl) return;
  getTarget(selectedEl).style.borderRadius = e.target.value + 'px';
};

propFont.oninput = e => {
  if (!selectedEl) return;
  getTarget(selectedEl).style.fontSize = e.target.value + 'px';
};

propColor.oninput = e => {
  if (!selectedEl) return;
  const t = getTarget(selectedEl);

  if (t.tagName === 'IMG') {
    t.style.border = `3px solid ${e.target.value}`;
  } else {
    t.style.background = e.target.value;
    t.style.color = "#fff";
  }
};

propOpacity.oninput = e => selectedEl && (selectedEl.style.opacity = e.target.value);

propShadow.oninput = e => {
  if (!selectedEl) return;
  selectedEl.style.boxShadow = `0 10px ${e.target.value}px rgba(0,0,0,0.5)`;
};

/* =========================
   LAYERS SYSTEM (FIXED)
========================= */
function updateLayers() {
  layersList.innerHTML = '';

  const items = document.querySelectorAll('.canvas-item');

  items.forEach((el, index) => {
    const layer = document.createElement('div');
    layer.className = 'layer-item';

    let name = "Element";
    if (el.innerText.trim() === "Text") name = "Text";
    if (el.innerHTML.includes("button")) name = "Button";
    if (el.innerHTML.includes("img")) name = "Image";
    if (el.innerText.includes("Container")) name = "Container";

    layer.innerText = `${index + 1}. ${name}`;

    layer.addEventListener('click', () => {
      document.querySelectorAll('.canvas-item')
        .forEach(i => i.classList.remove('selected'));

      el.classList.add('selected');
      selectedEl = el;

      panel.classList.add('active');
      loadProperties();

      highlightLayer(el);
    });

    layersList.appendChild(layer);
  });
}

/* =========================
   LAYER HIGHLIGHT
========================= */
function highlightLayer(el) {
  const items = document.querySelectorAll('.canvas-item');
  const layers = document.querySelectorAll('.layer-item');

  items.forEach((item, i) => {
    layers[i]?.classList.toggle('active', item === el);
  });
}

function clearLayerHighlight() {
  document.querySelectorAll('.layer-item')
    .forEach(l => l.classList.remove('active'));
}

/* =========================
   INIT
========================= */
updateLayers();

/* =========================
   SAVE + LOAD LAYOUT (LOCALSTORAGE)
========================= */

const SAVE_KEY = "uiforge_layout";

/* =========================
   SAVE FUNCTION
========================= */
function saveLayout() {
  const items = document.querySelectorAll('.canvas-item');

  const data = [];

  items.forEach(el => {
    data.push({
      html: el.innerHTML,
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height
    });
  });

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/* =========================
   LOAD FUNCTION
========================= */
function loadLayout() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);

  data.forEach(item => {
    const el = document.createElement('div');
    el.className = 'canvas-item';

    el.innerHTML = item.html;
    el.style.left = item.left;
    el.style.top = item.top;
    el.style.width = item.width;
    el.style.height = item.height;

    // re-add resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    el.appendChild(handle);

    canvas.appendChild(el);

    makeDraggable(el);
    makeResizable(el, handle);
    attachSelection(el);
  });

  updateLayers();
}

/* =========================
   AUTO SAVE (ON CHANGE)
========================= */
canvas.addEventListener('mouseup', saveLayout);
canvas.addEventListener('drop', saveLayout);

/* =========================
   LOAD ON START
========================= */
window.addEventListener('load', loadLayout);