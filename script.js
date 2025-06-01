let totalUang = Number(localStorage.getItem("uang")) || 0;
let riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];

function getLevel(xp) {
  if (xp < 1000000) return 0;
  if (xp < 2500000) return 1;
  if (xp < 5000000) return 2;
  if (xp < 10000000) return 3;
  return 4;
}

function getNextXP(level) {
  const batas = [1000000, 2500000, 5000000, 10000000, 99999999];
  return batas[level];
}

function updateImage(level) {
  const img = document.getElementById("charImage");
  img.src = `lv${level}.png`;
  img.alt = `Karakter Level ${level}`;
}

function tampilkanRiwayat() {
  const list = document.getElementById("riwayatList");
  list.innerHTML = "";
  riwayat.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.tanggal} - ${item.jenis}: Rp ${item.jumlah}`;
    list.appendChild(li);
  });
}

function tambahRiwayat(jenis, jumlah) {
  const now = new Date();
  const tanggal = now.toLocaleString("id-ID");
  riwayat.push({ tanggal, jenis, jumlah });
  localStorage.setItem("riwayat", JSON.stringify(riwayat));
}

function updateUI() {
  const level = getLevel(totalUang);
  const nextXP = getNextXP(level);
  document.getElementById("level").innerText = `Level: ${level}`;
  document.getElementById("xp").innerText = `XP: Rp ${totalUang} / Rp ${nextXP}`;
  document.getElementById("xpBar").value = totalUang;
  document.getElementById("xpBar").max = nextXP;
  updateImage(level);
  tampilkanRiwayat();
}

function tambahUang() {
  const jumlah = Number(prompt("Masukkan jumlah pemasukan:"));
  if (jumlah > 0) {
    totalUang += jumlah;
    localStorage.setItem("uang", totalUang);
    tambahRiwayat("Pemasukan", jumlah);
    updateUI();
  }
}

function kurangUang() {
  const jumlah = Number(prompt("Masukkan jumlah pengeluaran:"));
  if (jumlah > 0) {
    totalUang = Math.max(0, totalUang - jumlah);
    localStorage.setItem("uang", totalUang);
    tambahRiwayat("Pengeluaran", jumlah);
    updateUI();
  }
}

updateUI();


function renderChart() {
  const ctx = document.getElementById('grafikTransaksi').getContext('2d');
  const dataMap = {};

  riwayat.forEach(r => {
    const tanggal = r.tanggal.split(",")[0]; // ambil tanggal tanpa jam
    if (!dataMap[tanggal]) dataMap[tanggal] = { pemasukan: 0, pengeluaran: 0 };
    if (r.jenis === "Pemasukan") dataMap[tanggal].pemasukan += r.jumlah;
    else if (r.jenis === "Pengeluaran") dataMap[tanggal].pengeluaran += r.jumlah;
  });

  const labels = Object.keys(dataMap);
  const pemasukanData = labels.map(tgl => dataMap[tgl].pemasukan);
  const pengeluaranData = labels.map(tgl => dataMap[tgl].pengeluaran);

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pemasukan',
          backgroundColor: '#22c55e',
          data: pemasukanData
        },
        {
          label: 'Pengeluaran',
          backgroundColor: '#ef4444',
          data: pengeluaranData
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Statistik Harian'
        }
      }
    }
  });
}

const originalUpdateUI = updateUI;
updateUI = function() {
  originalUpdateUI();
  renderChart();
};
