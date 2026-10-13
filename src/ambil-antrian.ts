(() => {
  const session = requireAuth();
  if (!session) return;
  initSessionUI(session);

  const queueTypeSelect = document.getElementById("select-queue-type") as HTMLSelectElement | null;
  const prioritySelect = document.getElementById("select-priority") as HTMLSelectElement | null;
  const ticketForm = document.getElementById("form-issue-ticket") as HTMLFormElement | null;
  const ticketResult = document.getElementById("ticket-result") as HTMLOutputElement | null;
  const queueMessage = document.getElementById("queue-message") as HTMLElement | null;

  function renderQueueOptions(): void {
    if (!queueTypeSelect) return;

    const selectedCode = queueTypeSelect.value;
    const activeTypes = getQueueTypes().filter((type) => type.aktif);
    queueTypeSelect.replaceChildren(new Option("Pilih jenis antrian", ""));

    activeTypes.forEach((type) => {
      queueTypeSelect.add(new Option(`${type.nama} (${type.kode})`, type.kode));
    });

    if (activeTypes.some((type) => type.kode === selectedCode)) {
      queueTypeSelect.value = selectedCode;
    }

    if (queueMessage) {
      queueMessage.textContent = activeTypes.length
        ? ""
        : "Belum ada jenis antrian aktif. Silakan hubungi petugas.";
    }
  }

  ticketForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!queueTypeSelect || !prioritySelect || !ticketResult) return;

    const ticket = issueTicket(queueTypeSelect.value, prioritySelect.value as Priority);
    if (!ticket) return;

    ticketForm.reset();
    ticketResult.value = `Nomor antrian Anda: ${ticket.label}`;
  });

  renderQueueOptions();
  watchStorage(renderQueueOptions, 2000);
})();
