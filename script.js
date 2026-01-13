window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('signature-pad');
    const form = document.getElementById('attendance-form');
    const clearButton = document.getElementById('clear-signature');
    
    // Periksa apakah elemen canvas ada sebelum melanjutkan
    if (!canvas) {
        console.error("Elemen canvas dengan id 'signature-pad' tidak ditemukan!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    // Fungsi untuk menyesuaikan ukuran canvas (penting untuk responsivitas)
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
    }

    // Panggil saat halaman dimuat dan saat ukuran window berubah
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mengatur properti garis untuk tanda tangan
    ctx.strokeStyle = '#0056b3'; // Warna biru
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getPos(event) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (event.touches && event.touches.length > 0) {
            // Untuk event sentuhan (mobile)
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // Untuk event mouse (desktop)
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        return [
            clientX - rect.left,
            clientY - rect.top
        ];
    }

    function startDrawing(e) {
        drawing = true;
        [lastX, lastY] = getPos(e);
    }

    function draw(e) {
        if (!drawing) return;
        e.preventDefault(); // Mencegah scrolling halaman saat menggambar di mobile
        const [currentX, currentY] = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        [lastX, lastY] = [currentX, currentY];
    }

    function stopDrawing() {
        drawing = false;
    }
    
    // Event Listeners untuk Mouse (Desktop)
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Event Listeners untuk Sentuhan (Mobile)
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Fungsi untuk membersihkan tanda tangan
    clearButton.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Menangani pengiriman form
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isCanvasBlank = !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0);
        if (isCanvasBlank) {
            alert('Tanda tangan tidak boleh kosong!');
            return;
        }
        
        const signatureDataUrl = canvas.toDataURL('image/png');
        const formData = {
            nama: document.getElementById('nama').value,
            jabatan: document.getElementById('jabatan').value,
            instansi: document.getElementById('instansi').value,
            email: document.getElementById('email').value,
            telepon: document.getElementById('telepon').value,
            tandaTangan: signatureDataUrl
        };

        fetch('http://localhost:3000/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respon dari server:', data);
            alert('Terima kasih, kehadiran Anda telah dicatat!');
            form.reset();
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        })
        .catch(error => {
            console.error('Error saat mengirim ke server:', error);
            alert('Terjadi kesalahan saat mengirim data. Pastikan server sudah berjalan.');
        });
    });
});