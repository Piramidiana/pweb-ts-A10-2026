"use strict";
(() => {
    const session = requireAuth({ adminOnly: true });
    if (!session)
        return;
    function esc(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    const btnResetQueue = document.getElementById("btn-reset-queue");
    const formAddType = document.getElementById("form-add-type");
    const inputKode = document.getElementById("input-kode");
    const inputNama = document.getElementById("input-nama");
    const queueTypesList = document.getElementById("queue-types-list");
    const formIssueTicket = document.getElementById("form-issue-ticket");
    const selectQueueType = document.getElementById("select-queue-type");
    const selectPriority = document.getElementById("select-priority");
    const ticketsGroupedList = document.getElementById("tickets-grouped-list");

    initSessionUI(session);

    function renderDashboard() {
        const queueTypes = getQueueTypes();
        const tickets = getTickets();
        renderQueueTypes(queueTypes, tickets);
        renderSelectQueueTypes(queueTypes);
        renderTicketsGrouped(queueTypes, tickets);
    }

    function renderQueueTypes(types, tickets) {
        if (!queueTypesList)
            return;
        queueTypesList.innerHTML = "";
        if (types.length === 0) {
            queueTypesList.innerHTML = `<p style="color: #64748b; font-size: 0.9rem;">Belum ada jenis antrian.</p>`;
            return;
        }
        types.forEach((type) => {
            const waitingCount = tickets.filter((t) => t.kode === type.kode && t.status === "Menunggu").length;
            const item = document.createElement("div");
            item.className = "type-item";
            item.innerHTML = `
        <div class="type-info">
          <span class="type-name">${esc(type.nama)} (${esc(type.kode)})</span>
          <span class="type-sub">${waitingCount} menunggu</span>
        </div>
        <div class="type-actions">
          <button class="btn btn-outline btn-sm btn-toggle">
            ${type.aktif ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button class="btn btn-danger-outline btn-sm btn-delete">
            Hapus
          </button>
        </div>
      `;
            item.querySelector(".btn-toggle")?.addEventListener("click", () => {
                toggleQueueTypeStatus(type.kode);
            });
            item.querySelector(".btn-delete")?.addEventListener("click", () => {
                deleteQueueType(type.kode);
            });
            queueTypesList.appendChild(item);
        });
    }

    function renderSelectQueueTypes(types) {
        if (!selectQueueType)
            return;
        selectQueueType.innerHTML = `<option value="">Pilih jenis antrian</option>`;

        types
            .filter((t) => t.aktif)
            .forEach((t) => {
            const option = document.createElement("option");
            option.value = t.kode;
            option.textContent = `${t.nama} (${t.kode})`;
            selectQueueType.appendChild(option);
        });
    }

    function renderTicketsGrouped(types, tickets) {
        if (!ticketsGroupedList)
            return;
        ticketsGroupedList.innerHTML = "";
        if (types.length === 0) {
            ticketsGroupedList.innerHTML = `<p style="color: #64748b; font-size: 0.9rem; margin-top: 16px;">Tidak ada data antrian.</p>`;
            return;
        }
        types.forEach((type) => {
            const typeTickets = tickets.filter((t) => t.kode === type.kode);
            const groupDiv = document.createElement("div");
            groupDiv.className = "ticket-group";
            let ticketsHtml = "";
            if (typeTickets.length === 0) {
                ticketsHtml = `<p style="font-size: 0.85rem; color: #94a3b8; font-style: italic;">Belum ada tiket terbit.</p>`;
            }
            else {
                const sorted = [...typeTickets].reverse();
                ticketsHtml = sorted
                    .map((t) => {
                    const priorityClass = `badge-${t.prioritas.toLowerCase()}`;
                    const statusClass = t.status.toLowerCase();
                    return `
              <div class="ticket-row">
                <span class="ticket-label">${t.label}</span>
                <span class="badge ${priorityClass}">${t.prioritas}</span>
                <span class="badge-status ${statusClass}">${t.status}</span>
              </div>
            `;
                })
                    .join("");
            }
            groupDiv.innerHTML = `
        <div class="group-header">${esc(type.nama)}</div>
        ${ticketsHtml}
      `;
            ticketsGroupedList.appendChild(groupDiv);
        });
    }

    formAddType?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!inputKode || !inputNama)
            return;
        const kode = inputKode.value.trim().toUpperCase();
        const nama = inputNama.value.trim();

        if (!/^[A-Z]$/.test(kode)) {
            alert("Kode harus berupa 1 huruf kapital (misal: 'C')!");
            return;
        }
        const currentTypes = getQueueTypes();

        if (currentTypes.some((t) => t.kode.toUpperCase() === kode)) {
            alert(`Kode '${kode}' sudah digunakan!`);
            return;
        }
        if (currentTypes.some((t) => t.nama.toLowerCase() === nama.toLowerCase())) {
            alert(`Nama '${nama}' sudah digunakan!`);
            return;
        }
        currentTypes.push({ kode, nama, aktif: true });
        saveQueueTypes(currentTypes);
        inputKode.value = "";
        inputNama.value = "";
        renderDashboard();
    });

    function toggleQueueTypeStatus(kode) {
        const currentTypes = getQueueTypes();
        const target = currentTypes.find((t) => t.kode === kode);
        if (target) {
            target.aktif = !target.aktif;
            saveQueueTypes(currentTypes);
            renderDashboard();
        }
    }

    function deleteQueueType(kode) {
        if (confirm(`Apakah Anda yakin ingin menghapus jenis antrian ${kode}?`)) {
            const currentTypes = getQueueTypes().filter((t) => t.kode !== kode);
            saveQueueTypes(currentTypes);
            renderDashboard();
        }
    }

    formIssueTicket?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!selectQueueType || !selectPriority)
            return;
        const kode = selectQueueType.value;
        const prioritas = selectPriority.value;
        if (!kode) {
            alert("Pilih jenis antrian terlebih dahulu!");
            return;
        }
        if (issueTicket(kode, prioritas)) {
            selectQueueType.value = "";
            renderDashboard();
        }
    });

    btnResetQueue?.addEventListener("click", () => {
        if (confirm("Reset seluruh antrian dari awal? Seluruh tiket akan dihapus.")) {
            resetQueue();
            renderDashboard();
        }
    });

    renderDashboard();
    window.addEventListener("storage", renderDashboard);
})();
