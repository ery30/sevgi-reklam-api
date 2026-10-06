const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({ limit: '20mb' }));
app.use(cors());

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
        date: "2026-10-06",
        files: [] 
    },
    { 
        projNo: "SR-2026-002", 
        title: "Shell Totem Giydirme", 
        assignedTo: "eray", 
        status: "Yeni",
        date: "2026-10-05",
        files: [] 
    }
];

app.post('/api/login', (req, res) => {
    const { username, password, device } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({
            status: "success",
            message: "Giriş başarılı!",
            user: { username: user.username, role: user.role, device: device || "Bilinmiyor", time: new Date().toLocaleTimeString('tr-TR') }
        });
    } else {
        res.status(401).json({ status: "error", message: "Hatalı kullanıcı adı veya şifre!" });
    }
});

// Projeleri Listele ve Sırala
app.get('/api/projects', (req, res) => {
    const { username, role, sort } = req.query;
    let targetProjects = role === "yonetici" ? [...projects] : projects.filter(p => p.assignedTo === username);

    // Sıralama Mantığı (No'ya göre veya Tarihe göre)
    if (sort === "no_asc") {
        targetProjects.sort((a, b) => a.projNo.localeCompare(b.projNo));
    } else if (sort === "no_desc") {
        targetProjects.sort((a, b) => b.projNo.localeCompare(a.projNo));
    } else {
        // Varsayılan: En yeni eklenen en üstte
        targetProjects.reverse();
    }

    res.json({ status: "success", projects: targetProjects });
});

app.post('/api/projects/create', (req, res) => {
    const { projNo, title, assignedTo } = req.body;
    if (!projNo || !title) return res.status(400).json({ status: "error", message: "Eksik bilgi!" });
    
    projects.push({
        projNo,
        title,
        assignedTo: assignedTo || "Atanmadı",
        status: "Yeni",
        date: new Date().toISOString().split('T')[0],
        files: []
    });

    res.json({ status: "success", message: "Proje oluşturuldu!" });
});

app.post('/api/projects/upload', (req, res) => {
    const { projNo, fileName, fileData, uploadedBy } = req.body;
    const project = projects.find(p => p.projNo === projNo);
    if (!project) return res.status(404).json({ status: "error", message: "Proje bulunamadı!" });

    project.files.push({
        fileName,
        fileData,
        uploadedBy,
        time: new Date().toLocaleString('tr-TR')
    });

    res.json({ status: "success", message: "Dosya yüklendi!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
