(function () {
  // Revisi: layar wajib login (semua role)
  const session = requireAuth();
  if (!session) return;
  initSessionUI(session);

  const grid = document.getElementById("screen-grid") as HTMLElement | null;
  const updatedEl = document.getElementById("updated-at");
  const fsBtn = document.getElementById("btn-fullscreen") as HTMLButtonElement | null;
  const soundBtn = document.getElementById("btn-sound") as HTMLButtonElement | null;
  if (!grid) return;

  let soundOn = false;
  let lastCalled: Record<string, string> | null = null;

  function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
  ): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildCard(q: QueueType, tickets: Ticket[]): HTMLElement {
    const waiting = tickets.filter((t) => t.kode === q.kode && t.status === "Menunggu").length;
    const current = tickets.find((t) => t.kode === q.kode && t.status === "Dipanggil");

    const card = el("section", "screen-card");

    const head = el("div", "screen-head");
    head.appendChild(el("h2", "screen-name", q.nama));
    head.appendChild(el("span", "screen-code", q.kode));
    card.appendChild(head);

    const body = el("div", "screen-body");
    if (current) {
      body.appendChild(el("div", "badge", "● DIPANGGIL"));
      body.appendChild(el("div", "big-number", current.label));
    } else {
      body.appendChild(el("p", "none-title", "Belum ada nomor dipanggil"));
      body.appendChild(el("p", "none-sub", "Nomor akan muncul setelah operator memanggil tiket."));
    }
    card.appendChild(body);

    card.appendChild(el("div", "screen-foot", `${waiting} tiket menunggu`));
    return card;
  }

  function announce(label: string, namaLayanan: string): void {
    if (!soundOn || !("speechSynthesis" in window)) return;
    const spoken = label.replace("-", " ").split("").join(" ");
    const u = new SpeechSynthesisUtterance(
      `Nomor antrian ${spoken}, silakan menuju ${namaLayanan}`
    );
    u.lang = "id-ID";
    window.speechSynthesis.speak(u);
  }

  function render(): void {
    const types = getQueueTypes().filter((q) => q.aktif);
    const tickets = getTickets();

    grid!.replaceChildren();
    if (types.length === 0) {
      grid!.appendChild(el("p", "empty", "Belum ada jenis antrian aktif."));
    } else {
      types.forEach((q) => grid!.appendChild(buildCard(q, tickets)));
    }

    const now: Record<string, string> = {};
    types.forEach((q) => {
      const cur = tickets.find((t) => t.kode === q.kode && t.status === "Dipanggil");
      if (cur) now[q.kode] = cur.label;
    });
    if (lastCalled !== null) {
      types.forEach((q) => {
        if (now[q.kode] && now[q.kode] !== lastCalled![q.kode]) {
          announce(now[q.kode], q.nama);
        }
      });
    }
    lastCalled = now;

    if (updatedEl) {
      updatedEl.textContent = `Diperbarui ${new Date().toLocaleTimeString("id-ID")}`;
    }
  }

  function updateFsLabel(): void {
    if (fsBtn) {
      fsBtn.textContent = document.fullscreenElement ? "Keluar Layar Penuh" : "Layar Penuh";
    }
  }

  if (fsBtn) {
    fsBtn.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen gagal:", err);
      }
    });
    document.addEventListener("fullscreenchange", updateFsLabel);
  }

  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundOn = !soundOn;
      soundBtn.textContent = soundOn ? "Suara: Aktif" : "Suara: Mati";
      soundBtn.setAttribute("aria-pressed", String(soundOn));
    });
  }

  render();
  watchStorage(render, 2000);
})();