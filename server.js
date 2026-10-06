const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Ana Sayfa Kontrolü
app.get('/', (req, res) => {
    res.json({ status: "online", message: "Sevgi Reklam Bulut API Aktif!" });
});

// Giriş (Login) Uç Noktası
app.post('/api/login', (req, res) => {
    const { username, password, device } = req.body;

    // Yönetici veya kullanıcı doğrulama
    if ((username === "eray" && password === "123456") || (username === "admin" && password === "1234")) {
        res.json({
            status: "success",
            message: "Bulut sunucu üzerinden giriş başarılı!",
            user: {
                username: username,
                device: device || "Bilinmiyor",
                time: new Date().toLocaleTimeString('tr-TR')
            }
        });
    } else {
        res.status(401).json({
            status: "error",
            message: "Hatalı kullanıcı adı veya şifre!"
        });
    }
});

// Port Ayarı (Render otomatik port atar)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});