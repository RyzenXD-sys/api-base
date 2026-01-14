// plugins/Islam/surah.js
const axios = require("axios");

module.exports = {
  name: "GetSurah",
  desc: "Mengambil surah Al-Qur’an lengkap dengan teks Arab dan terjemahan Indonesia",
  category: "Islam",
  method: "GET",
  path: "/surah",
  params: ["number"],
  example: "https://domainweb.com/islam/surah?number=1",

  async run(req, res) {
    const { number } = req.query;

    // Validasi input
    if (!number || isNaN(number)) {
      return res.status(400).json({
        status: false,
        message: "Parameter ?number= wajib diisi dan harus berupa angka",
        contoh: "?number=1"
      });
    }

    try {
      const url = `https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,id.indonesian`;

      const { data } = await axios.get(url);

      if (!data?.data || data.data.length < 2) {
        return res.status(500).json({
          status: false,
          message: "Data surah tidak valid",
          timestamp: new Date().toISOString()
        });
      }

      const arab = data.data[0];
      const indo = data.data[1];

      const ayahs = arab.ayahs.map((a, i) => ({
        number: a.numberInSurah,
        arabic: a.text,
        translation: indo.ayahs[i]?.text
      }));

      res.json({
        status: true,
        data: {
          number: arab.number,
          name: arab.englishName,
          arabic_name: arab.name,
          total_ayah: arab.numberOfAyahs,
          ayahs
        },
        metadata: {
          source: "alquran.cloud",
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Get Surah Error:", error.message);
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data surah",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
