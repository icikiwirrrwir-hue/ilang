let reports = JSON.parse(localStorage.getItem('lost_items')) || [
    {
        id: 1,
        status: 'Hilang',
        namaPelapor: 'Ahmad Fauzi',
        kontak: '081298765432',
        namaBarang: 'Dompet Kulit Coklat (Isi STNK & KTP)',
        kategori: 'Dompet & Tas',
        lokasi: 'Kawasan Malioboro, Yogyakarta',
        tanggal: '2026-06-01',
        deskripsi: 'Hilang di sekitar area parkir timur. Ada hadiah bagi yang menemukan.',
        foto: ''
    },
    {
        id: 2,
        status: 'Temuan',
        namaPelapor: 'Siti Rahma',
        kontak: '085612345678',
        namaBarang: 'Kunci Motor Honda & STNK',
        kategori: 'Dokumen',
        lokasi: 'Fakultas Teknik Kampus',
        tanggal: '2026-06-02',
        deskripsi: 'Ditemukan di atas meja kantin area pojok.',
        foto: ''
    }
];

const reportForm = document.getElementById('reportForm');
const itemsContainer = document.getElementById('itemsContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');

const fotoInput = document.getElementById('fotoBarang');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImageBtn');

let currentBase64Image = '';

function compressImage(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

fotoInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        currentBase64Image = await compressImage(file);
        imagePreview.src = currentBase64Image;
        imagePreviewContainer.classList.remove('hidden');
    } catch (err) {
        alert('Gagal memproses gambar. Pastikan file berupa foto yang valid.');
        console.error(err);
    }
});

removeImageBtn.addEventListener('click', function() {
    fotoInput.value = '';
    currentBase64Image = '';
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
});

function renderReports(filterText = '') {
    itemsContainer.innerHTML = '';
    
    const filteredReports = reports.filter(item => 
        item.namaBarang.toLowerCase().includes(filterText.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(filterText.toLowerCase()) ||
        item.kategori.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredReports.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    filteredReports.slice().reverse().forEach(item => {
        const badgeClass = item.status === 'Hilang' ? 'badge-hilang' : 'badge-temuan';
        
        const imageHTML = item.foto 
            ? `<div class="card-image-box">
                   <img src="${item.foto}" alt="${escapeHTML(item.namaBarang)}">
               </div>`
            : `<div class="card-no-image">
                   <span style="font-size: 1.5rem; margin-bottom: 0.25rem;">📷</span>
                   <span style="font-size: 0.75rem;">Tidak ada foto dilampirkan</span>
               </div>`;

        const card = document.createElement('div');
        card.className = "report-card";
        card.innerHTML = `
            <div>
                <div class="card-top">
                    <span class="badge ${badgeClass}">${item.status}</span>
                    <span class="card-date">${item.tanggal}</span>
                </div>
                ${imageHTML}
                <h3 class="card-title">${escapeHTML(item.namaBarang)}</h3>
                <p class="card-category">${escapeHTML(item.kategori)}</p>
                <p class="card-location">📍 ${escapeHTML(item.lokasi)}</p>
                <p class="card-desc">"${escapeHTML(item.deskripsi || 'Tidak ada deskripsi tambahan.')}"</p>
            </div>
            <div class="card-footer">
                <span class="reporter-name">Pelapor: <strong>${escapeHTML(item.namaPelapor)}</strong></span>
                <a href="https://wa.me/${formatPhone(item.kontak)}?text=Halo%2C%20saya%20menghubungi%20terkait%20laporan%20${encodeURIComponent(item.namaBarang)}" target="_blank" class="btn-wa">
                    💬 Hubungi
                </a>
            </div>
        `;
        itemsContainer.appendChild(card);
    });
}

reportForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newReport = {
        id: Date.now(),
        status: document.getElementById('status').value,
        namaPelapor: document.getElementById('namaPelapor').value,
        kontak: document.getElementById('kontak').value,
        namaBarang: document.getElementById('namaBarang').value,
        kategori: document.getElementById('kategori').value,
        lokasi: document.getElementById('lokasi').value,
        tanggal: document.getElementById('tanggal').value,
        deskripsi: document.getElementById('deskripsi').value,
        foto: currentBase64Image
    };

    try {
        reports.push(newReport);
        localStorage.setItem('lost_items', JSON.stringify(reports));

        reportForm.reset();
        currentBase64Image = '';
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');

        renderReports();
        alert('Laporan berhasil dikirim!');
    } catch (err) {
        alert('Penyimpanan browser penuh! Hapus beberapa data lama atau upload foto dengan ukuran lebih kecil.');
        reports.pop();
    }
});

searchInput.addEventListener('input', function(e) {
    renderReports(e.target.value);
});

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function formatPhone(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
}

renderReports();
