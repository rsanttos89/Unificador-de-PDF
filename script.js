const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const pdfList = document.getElementById("pdfList");
const pdfContainer = document.getElementById("pdfContainer");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const mergeBtn = document.getElementById("mergeBtn");
const navigation = document.getElementById("navigation");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

let pdfs = [];
let currentPdfIndex = 0;
let draggedItem = null;

// Upload event listeners
uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", (e) => {
  handleFiles(e.target.files);
});

function handleFiles(files) {
  for (let file of files) {
    if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      pdfs.push({
        name: file.name,
        url: url,
        file: file,
      });
    }
  }
  fileInput.value = "";
  updateUI();
}

function updateUI() {
  updatePdfList();
  updateViewer();
  updateNavigation();
}

function updatePdfList() {
  pdfList.innerHTML = "";

  if (pdfs.length === 0) {
    pdfList.innerHTML =
      '<p style="color: #999; text-align: center; padding: 20px 0;">Nenhum PDF adicionado</p>';
    return;
  }

  pdfList.innerHTML = `<h3>Total: ${pdfs.length} arquivo(s)</h3>`;

  pdfs.forEach((pdf, index) => {
    const div = document.createElement("div");
    div.className = "pdf-item";
    div.draggable = true;
    div.dataset.index = index;

    div.innerHTML = `
      <div class="pdf-number">${index + 1}</div>
      <div class="pdf-name" title="${pdf.name}">${pdf.name}</div>
      <button class="pdf-remove" onclick="removePdf(${index})">✕</button>
    `;

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragleave", handleDragLeave);

    pdfList.appendChild(div);
  });
}

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  document.querySelectorAll(".pdf-item").forEach((item) => {
    item.classList.remove("drag-over");
  });
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (this !== draggedItem) {
    this.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    const allItems = [...document.querySelectorAll(".pdf-item")];
    const draggedIndex = parseInt(draggedItem.dataset.index);
    const targetIndex = parseInt(this.dataset.index);

    const [draggedPdf] = pdfs.splice(draggedIndex, 1);
    const insertIndex =
      draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    pdfs.splice(insertIndex, 0, draggedPdf);

    updateUI();
  }
  this.classList.remove("drag-over");
}

function removePdf(index) {
  pdfs.splice(index, 1);
  if (currentPdfIndex >= pdfs.length && currentPdfIndex > 0) {
    currentPdfIndex--;
  }
  updateUI();
}

function updateViewer() {
  pdfContainer.innerHTML = "";

  if (pdfs.length === 0) {
    pdfContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>Nenhum PDF selecionado</h3>
        <p>Arraste PDFs para a lista ou clique para adicionar</p>
      </div>
    `;
    return;
  }

  pdfs.forEach((pdf, index) => {
    const frame = document.createElement("div");
    frame.className = "pdf-frame";
    if (index === currentPdfIndex) frame.classList.add("active");

    frame.innerHTML = `
      <div class="pdf-title">📄 ${pdf.name}</div>
      <embed src="${pdf.url}" type="application/pdf" />
    `;

    pdfContainer.appendChild(frame);
  });
}

function updateNavigation() {
  if (pdfs.length > 1) {
    navigation.style.display = "flex";
    pageInfo.textContent = `PDF ${currentPdfIndex + 1} de ${pdfs.length}`;
    prevBtn.disabled = currentPdfIndex === 0;
    nextBtn.disabled = currentPdfIndex === pdfs.length - 1;
  } else {
    navigation.style.display = "none";
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPdfIndex > 0) {
    currentPdfIndex--;
    updateViewer();
    updateNavigation();
    pdfContainer.scrollTop = 0;
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPdfIndex < pdfs.length - 1) {
    currentPdfIndex++;
    updateViewer();
    updateNavigation();
    pdfContainer.scrollTop = 0;
  }
});

clearBtn.addEventListener("click", () => {
  if (
    pdfs.length > 0 &&
    confirm("Tem certeza que deseja limpar todos os PDFs?")
  ) {
    pdfs = [];
    currentPdfIndex = 0;
    updateUI();
  }
});

downloadBtn.addEventListener("click", () => {
  if (pdfs.length === 0) return;

  let content = "Lista de PDFs Unificados\n";
  content += "========================\n";
  content += `Data: ${new Date().toLocaleString("pt-BR")}\n`;
  content += `Total de PDFs: ${pdfs.length}\n\n`;

  pdfs.forEach((pdf, index) => {
    content += `${index + 1}. ${pdf.name}\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lista_pdfs_${new Date().getTime()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

downloadBtn.addEventListener("click", () => {
  downloadBtn.disabled = pdfs.length === 0;
});

// Enable download button when PDFs are added
setInterval(() => {
  downloadBtn.disabled = pdfs.length === 0;
  mergeBtn.disabled = pdfs.length === 0;
}, 1000);

// Merged PDF button
mergeBtn.addEventListener("click", async () => {
  if (pdfs.length === 0) return;

  mergeBtn.disabled = true;
  mergeBtn.textContent = "⏳ Processando...";

  try {
    const { PDFDocument } = PDFLib;

    const mergedPdf = await PDFDocument.create();

    for (const pdf of pdfs) {
      const arrayBuffer = await pdf.file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        sourcePdf.getPageIndices(),
      );

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pdfs_unificados_${new Date().getTime()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    alert("✅ PDF unificado gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao mesclar PDFs:", error);
    alert("❌ Erro ao mesclar PDFs. Verifique o console.");
  } finally {
    mergeBtn.disabled = pdfs.length === 0;
    mergeBtn.textContent = "✨ Mesclar e Baixar";
  }
});
