// Import package yang dibutuhkan
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Inisialisasi aplikasi Express
const app = express();
const PORT = 3000;

// Gunakan middleware
app.use(cors()); // Mengizinkan request dari domain lain (front-end kita)
app.use(express.json({ limit: '10mb' })); // Untuk membaca body JSON dari request, dengan limit besar untuk gambar
app.use(express.urlencoded({ extended: true }));

// Pastikan folder untuk menyimpan tanda tangan sudah ada
const signaturesDir = path.join(__dirname, 'signatures');
if (!fs.existsSync(signaturesDir)) {
    fs.mkdirSync(signaturesDir);
}

// Definisikan endpoint untuk menerima data formulir
app.post('/submit', (req, res) => {
    try {
        const { nama, jabatan, instansi, email, telepon, tandaTangan } = req.body;

        // --- 1. Proses dan Simpan Tanda Tangan ---
        // tandaTangan adalah data URL base64 (contoh: "data:image/png;base64,iVBORw0KGgo...")
        const base64Data = tandaTangan.replace(/^data:image\/png;base64,/, "");
        const signatureFileName = `signature_${Date.now()}.png`;
        const signatureFilePath = path.join(signaturesDir, signatureFileName);
        
        fs.writeFileSync(signatureFilePath, base64Data, 'base64');
        console.log(`Tanda tangan disimpan di: ${signatureFilePath}`);

        // --- 2. Simpan Data Teks ke File CSV ---
        const csvFilePath = path.join(__dirname, 'data.csv');
        const csvHeader = "Nama,Jabatan,Instansi,Email,Telepon,File Tanda Tangan\n";
        const csvRow = `"${nama}","${jabatan}","${instansi}","${email}","${telepon}","${signatureFileName}"\n`;

        // Jika file CSV belum ada, tulis headernya dulu
        if (!fs.existsSync(csvFilePath)) {
            fs.writeFileSync(csvFilePath, csvHeader);
        }

        // Tambahkan baris baru ke file CSV
        fs.appendFileSync(csvFilePath, csvRow);
        console.log(`Data teks disimpan di: ${csvFilePath}`);

        // --- 3. Kirim Respon Sukses ke Front-end ---
        res.status(200).json({ message: 'Data kehadiran berhasil disimpan!' });

    } catch (error) {
        console.error('Terjadi kesalahan di server:', error);
        res.status(500).json({ message: 'Gagal menyimpan data.' });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di https://sudjasmo.github.io/DaftarHadir/`);

});
