const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '15mb' })); // Büyük fotoğraflar için limit artırıldı
app.use(cors());

// Bellek içi örnek veritabanı (İleride MongoDB/SQL yapılabilir)
let users = [
    { username: "eray", password: "123", role: "yonetici" },
    { username: "ferdi", password: "123", role: "yonetici" },
    { username: "muhammet", password: "123", role: "usta" }
];

let projects = [
    { 
        projNo: "SR-2026-001", 
        title: "Opet Kanopi Montajı", 
        assignedTo: "muhammet", 
        status: "Devam Ediyor",
        files: [] 
    },
    { 
        projNo: "SR-2026-002", 
        title: "Shell Totem Giydirme", 
        assignedTo: "eray", 
        status: "Planlanıyor",
        files: [] 
    }
];

// Giriş (Login) Uç Noktası
app.post('/api/login', (req, res) => {
    const { username, password, device } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({
            status: "success",
            message: "Giriş başarılı!",
            user: {
                username: user.username,
                role: user.role, // 'yonetici' veya 'usta'
                device: device || "Bilinmiyor",
                time: new Date().toLocaleTimeString('tr-TR')
            }
        });
    } else {
        res.status(401).json({ status: "error", message: "Hatalı kullanıcı adı veya şifre!" });
    }
});

// Projeleri Listele (Yönetici hepsini, usta sadece kendine atananı görür)
app.get('/api/projects', (req, res) => {
    const { username, role } = req.query;
    if (role === "yonetici") {
        res.json({ status: "success", projects });
    } else {
        const userProjects = projects.filter(p => p.assignedTo === username);
        res.json({ status: "success", projects: userProjects });
    }
});

// Yeni Proje Oluştur (Sadece Yöneticiler)
app.post('/api/projects/create', (req, res) => {
    const { projNo, title, assignedTo } = req.body;
    if (!projNo || !title) {
        return res.status(400).json({ status: "error", message: "Proje numarası ve başlığı zorunludur!" });
    }
    
    projects.push({
        projNo,
        title,
        assignedTo: assignedTo || "Atanmadı",
        status: "Yeni",
        files: []
    });

    res.json({ status: "success", message: "Proje başarıyla oluşturuldu!" });
});

// Projeye Dosya / Fotoğraf Yükle
app.post('/api/projects/upload', (req, res) => {
    const { projNo, fileName, fileData, uploadedBy } = req.body;
    const project = projects.find(p => p.projNo === projNo);

    if (!project) {
        return res.status(404).json({ status: "error", message: "Proje bulunamadı!" });
    }

    project.files.push({
        fileName,
        fileData, // Base64 formatında dosya/fotoğraf
        uploadedBy,
        time: new Date().toLocaleString('tr-TR')
    });

    res.json({ status: "success", message: "Dosya başarıyla yüklendi!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
