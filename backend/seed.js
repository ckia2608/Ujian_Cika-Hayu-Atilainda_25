const pool = require("./db");

async function seedDatabase() {
  try {

    await pool.query(`
    TRUNCATE TABLE peminjaman, alat, kategori_alat
    RESTART IDENTITY CASCADE;
`);

    // Mengisi data kategori
    await pool.query(`
      INSERT INTO kategori_alat (nama_kategori, deskripsi) VALUES
      ('Komputer & Jaringan', 'Peralatan lab komputer, server, dan jaringan'),
      ('Multimedia', 'Peralatan fotografi, videografi, dan presentasi'),
      ('Elektronika', 'Komponen dan alat ukur kelistrikan');
    `);

    // Mengisi data alat
    await pool.query(`
      INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi) VALUES
      (1, 'Kabel UTP Cat6 (Roll)', 'Baik', 10, 'Lemari Jaringan A'),
      (1, 'Crimping Tool', 'Baik', 25, 'Lemari Jaringan B'),
      (2, 'Kamera DSLR Canon', 'Baik', 5, 'Loker Multimedia 1'),
      (2, 'Proyektor Epson', 'Baik', 8, 'Loker Multimedia 2'),
      (3, 'Multimeter', 'Baik', 20, 'Rak Elektro C');
    `);

    console.log("Seeding berhasil!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await pool.end();
  }
}

seedDatabase();