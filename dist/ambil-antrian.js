"use strict";
(() => {
    const session = requireAuth();
    if (!session)
        return;
    initSessionUI(session);
    const queueTypeSelect = document.getElementById("select-queue-type");
    const prioritySelect = document.getElementById("select-priority");
    const ticketForm = document.getElementById("form-issue-ticket");
    const ticketResult = document.getElementById("ticket-result");
    const queueMessage = document.getElementById("queue-message");
    function renderQueueOptions() {
        if (!queueTypeSelect)
            return;
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
        if (!queueTypeSelect || !prioritySelect || !ticketResult)
            return;
        const ticket = issueTicket(queueTypeSelect.value, prioritySelect.value);
        if (!ticket)
            return;

        ticketForm.reset();
        ticketResult.value = `Nomor antrian Anda: ${ticket.label}`;
    });
    renderQueueOptions();
    watchStorage(renderQueueOptions, 2000);
})();
