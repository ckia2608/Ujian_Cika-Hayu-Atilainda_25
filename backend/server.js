const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Tes koneksi server
app.get("/", (req, res) => {
    res.json({
        pesan: "Backend Peminjaman Alat Berhasil Berjalan!"
    });
});

// Mengambil semua kategori alat (GET)
app.get("/api/kategori_alat", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM kategori_alat ORDER BY id_kategori ASC"
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Gagal mengambil data kategori"
        });
    }
});

// Mengambil semua alat beserta nama kategorinya (GET)
app.get("/api/alat", async (req, res) => {
    try {
        const query = `
            SELECT
                a.id_alat,
                a.nama_alat,
                a.kondisi,
                a.stok,
                a.lokasi,
                a.id_kategori,
                k.nama_kategori
            FROM alat a
            LEFT JOIN kategori_alat k
            ON a.id_kategori = k.id_kategori
            ORDER BY a.id_alat ASC
        `;

        const result = await pool.query(query);

        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Gagal mengambil data alat"
        });
    }
});

// Mengambil semua data peminjaman (GET)
app.get("/api/peminjaman", async (req, res) => {
    try {
        const query = `
            SELECT
                p.id_peminjaman,
                p.nama_peminjam,
                p.kelas,
                TO_CHAR(p.tanggal_pinjam, 'DD-MM-YYYY') AS tanggal_pinjam,
                TO_CHAR(p.tanggal_kembali, 'DD-MM-YYYY') AS tanggal_kembali,
                p.jumlah,
                p.status,
                a.nama_alat
            FROM peminjaman p
            LEFT JOIN alat a
            ON p.id_alat = a.id_alat
            ORDER BY p.id_peminjaman DESC
        `;

        const result = await pool.query(query);

        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Gagal mengambil data peminjaman"
        });
    }
});

// validasi tambah peminjaman (POST)
app.post("/api/peminjaman", async (req, res) => {
    try {
        const {
            id_alat,
            nama_peminjam,
            kelas,
            jumlah,
            tanggal_pinjam,
            tanggal_kembali
        } = req.body;

        if (
            !id_alat ||
            !nama_peminjam ||
            !kelas ||
            !jumlah ||
            !tanggal_pinjam||
            !tanggal_kembali||
            !Number.isInteger(Number(jumlah)) ||
            Number(jumlah) <= 0
        ) {
            return res.status(400).json({
                error: "Data peminjaman tidak lengkap atau tidak valid"
            });
        }

        const result = await pool.query(
            `INSERT INTO peminjaman
            (id_alat, nama_peminjam, kelas, jumlah, tanggal_pinjam, tanggal_kembali)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING 
            id_alat,
            nama_peminjam,
            kelas, 
            jumlah,
            TO_CHAR(tanggal_pinjam, 'DD-MM-YYYY') AS tanggal_pinjam,
            TO_CHAR(tanggal_kembali, 'DD-MM-YYYY') AS tanggal_kembali`,
            [id_alat, nama_peminjam, kelas, jumlah, tanggal_pinjam, tanggal_kembali]
        );

        res.status(201).json(result.rows[0]
        );

    } catch (err) {
        console.error(err.message);
        res.status(400).json({
            error: err.message
        });
    }
});

// Mengembalikan alat yang di pinjam (PUT)
app.put("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE peminjaman
             SET status = 'Dikembalikan',
                 tanggal_kembali = CURRENT_DATE
             WHERE id_peminjaman = $1
             AND status = 'Dipinjam'
             RETURNING 
             id_alat,
             nama_peminjam,
             kelas, 
             jumlah,
             TO_CHAR(tanggal_pinjam, 'DD-MM-YYYY') AS tanggal_pinjam,
             TO_CHAR(tanggal_kembali, 'DD-MM-YYYY') AS tanggal_kembali`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Peminjaman tidak ditemukan atau sudah dikembalikan"
            });
        }

        res.json({
            pesan: "Alat berhasil dikembalikan",
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
}); 

// menghapus data peminjaman berdasarkan id (DELETE)
app.delete("/api/peminjaman/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM peminjaman
             WHERE id_peminjaman = $1
             RETURNING 
             id_alat,
             nama_peminjam,
             kelas, 
             jumlah,
             TO_CHAR(tanggal_pinjam, 'DD-MM-YYYY') AS tanggal_pinjam,
             TO_CHAR(tanggal_kembali, 'DD-MM-YYYY') AS tanggal_kembali`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Data peminjaman tidak ditemukan"
            });
        }

        res.json({
            pesan: "Data peminjaman berhasil dihapus",
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: err.message
        });
    }
});

// Tes koneksi database
app.get("/api/tes-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            pesan: "Database berhasil terhubung!",
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            error: "Database gagal terhubung"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});