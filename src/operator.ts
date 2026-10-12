(function () {
  // Auth guard: cukup login (admin / moderator / user boleh masuk)
  const session = requireAuth();
  if (!session) return;

  // Urutan prioritas: makin besar makin didahulukan (Normal paling bawah)
  const PRIORITY_RANK: Record<Priority, number> = {
    VIP: 3,
    Disabilitas: 2,
    Lansia: 1,
    Normal: 0,
  };

  // Urutkan tiket: prioritas tinggi dulu, jika sama -> yang lebih dulu dibuat (FIFO)
  function sortByPriority(list: Ticket[]): Ticket[] {
    return [...list].sort((a, b) => {
      const diff = PRIORITY_RANK[b.prioritas] - PRIORITY_RANK[a.prioritas];
      return diff !== 0 ? diff : a.createdAt - b.createdAt;
    });
  }

  function waitingOf(kode: string, tickets: Ticket[]): Ticket[] {
    return sortByPriority(
      tickets.filter((t) => t.kode === kode && t.status === "Menunggu")
    );
  }

  function currentOf(kode: string, tickets: Ticket[]): Ticket | undefined {
    return tickets.find((t) => t.kode === kode && t.status === "Dipanggil");
  }

  // ---------- Aksi operator (selalu baca data terbaru dari Local Storage) ----------

  function callNext(kode: string): void {
    const tickets = getTickets();
    const current = currentOf(kode, tickets);
    if (current) current.status = "Selesai";

    const next = waitingOf(kode, tickets)[0];
    if (next) next.status = "Dipanggil";

    saveTickets(tickets);
    render();
  }

  function finishCurrent(kode: string): void {
    const tickets = getTickets();
    const current = currentOf(kode, tickets);
    if (!current) return;
    current.status = "Selesai";
    saveTickets(tickets);
    render();
  }

  function skipCurrent(kode: string): void {
    const tickets = getTickets();
    const current = currentOf(kode, tickets);
    if (!current) return;
    current.status = "Dilewati";
    saveTickets(tickets);
    render();
  }

  // ---------- Render ----------

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

  function infoBlock(title: string, value: string, sub?: string): HTMLElement {
    const box = el("div", "info");
    box.appendChild(el("div", "info-title", title));
    box.appendChild(el("div", "info-value", value));
    if (sub) box.appendChild(el("div", "info-sub", sub));
    return box;
  }

  function buildCard(q: QueueType, tickets: Ticket[]): HTMLElement {
    const waiting = waitingOf(q.kode, tickets);
    const current = currentOf(q.kode, tickets);
    const next = waiting[0];

    const card = el("section", "card");

    const head = el("div", "card-head");
    head.appendChild(el("h2", "card-name", q.nama));
    head.appendChild(el("span", "card-count", `${waiting.length} menunggu`));
    card.appendChild(head);

    const info = el("div", "info-row");
    info.appendChild(infoBlock("SEDANG DIPANGGIL", current ? current.label : "-"));
    info.appendChild(
      infoBlock(
        "BERIKUTNYA",
        next ? next.label : "-",
        next ? `Prioritas ${next.prioritas}` : undefined
      )
    );
    card.appendChild(info);

    const actions = el("div", "actions");

    const btnNext = el("button", "btn btn-primary", "Panggil Berikutnya");
    btnNext.type = "button";
    btnNext.disabled = waiting.length === 0;
    btnNext.addEventListener("click", () => callNext(q.kode));

    const btnDone = el("button", "btn btn-outline", "Selesai");
    btnDone.type = "button";
    btnDone.disabled = !current;
    btnDone.addEventListener("click", () => finishCurrent(q.kode));

    const btnSkip = el("button", "btn btn-outline", "Lewati");
    btnSkip.type = "button";
    btnSkip.disabled = !current;
    btnSkip.title = "Tandai tiket yang sedang dipanggil sebagai tidak hadir";
    btnSkip.addEventListener("click", () => skipCurrent(q.kode));

    actions.append(btnNext, btnDone, btnSkip);
    card.appendChild(actions);

    if (waiting.length === 0) {
      card.appendChild(
        el("p", "hint", "Tidak ada tiket menunggu untuk jenis antrian ini.")
      );
    }
    return card;
  }

  function render(): void {
    const grid = document.getElementById("queue-grid");
    if (!grid) return;

    const types = getQueueTypes().filter((q) => q.aktif);
    const tickets = getTickets();

    grid.replaceChildren();

    if (types.length === 0) {
      grid.appendChild(
        el("p", "empty", "Belum ada jenis antrian aktif. Tambahkan lewat Dashboard Admin.")
      );
      return;
    }
    types.forEach((q) => grid.appendChild(buildCard(q, tickets)));
  }

  // ---------- Init ----------

  const userEl = document.getElementById("user-info");
  if (userEl) userEl.textContent = `${session.firstName} (${session.role})`;

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  render();
  watchStorage(render, 2000);
})();