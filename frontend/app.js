const API = "http://localhost:5000";

// Menampilkan daftar alat
async function tampilkanAlat() {
    const response = await fetch(`${API}/api/alat`);
    const data = await response.json();

    const daftar = document.getElementById("daftar_alat");
    const pilihan = document.getElementById("id_alat");

    daftar.innerHTML = "";
    pilihan.innerHTML = '<option value="">Pilih Alat</option>';

    data.forEach(alat => {
        daftar.innerHTML += `
            <tr>
                <td>${alat.id_alat}</td>
                <td>${alat.nama_alat}</td>
                <td>${alat.nama_kategori}</td>
                <td>${alat.stok}</td>
                <td>${alat.lokasi}</td>
            </tr>
        `;

        pilihan.innerHTML += `
            <option value="${alat.id_alat}">
                ${alat.nama_alat}
            </option>
        `;
    });
}

tampilkanAlat();

// Menampilkan riwayat peminjaman
async function tampilkanPeminjaman() {
    const response = await fetch(`${API}/api/peminjaman`);
    const data = await response.json();

    const riwayat = document.getElementById("dataPeminjaman");

    riwayat.innerHTML = "";

    data.forEach(pinjam => {
        riwayat.innerHTML += `
            <tr>
                <td>${pinjam.id_peminjaman}</td>
                <td>${pinjam.nama_peminjam}</td>
                <td>${pinjam.kelas}</td>
                <td>${pinjam.nama_alat}</td>
                <td>${pinjam.jumlah}</td>
                <td>${pinjam.tanggal_pinjam}</td>
                <td>${pinjam.tanggal_kembali || "-"}</td>
            </tr>
        `;
    });
}

tampilkanPeminjaman();

// Menyimpan data peminjaman
document.getElementById("Peminjaman").addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        id_alat: document.getElementById("id_alat").value,
        nama_peminjam: document.getElementById("nama_peminjam").value,
        kelas: document.getElementById("kelas").value,
        tanggal_pinjam: document.getElementById("tanggal_pinjam").value,
        tanggal_kembali: document.getElementById("tanggal_kembali").value,
        jumlah: document.getElementById("jumlah").value
    };

    const response = await fetch(`${API}/api/peminjaman`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const hasil = await response.json();

    if (response.ok) {
        alert("Peminjaman berhasil disimpan!");

        document.getElementById("Peminjaman").reset();

        tampilkanAlat();
        tampilkanPeminjaman();
    } else {
        alert(hasil.message || "Peminjaman gagal disimpan");
    }
});