const axios = require("axios")
const cheerio = require("cheerio")

const TARGET = "https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg"
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

module.exports = {
  name: "Gempa Terkini",
  desc: "Daftar gempa bumi terkini dari BMKG",
  category: "Info",
  method: "GET",
  path: "/gempa2",
  params: ["limit"],

  async run(req, res) {
    try {
      const limit = Math.min(
        parseInt(req.query.limit) || 10,
        50
      )

      const { data: html } = await axios.get(TARGET, {
        headers: { "user-agent": UA },
        timeout: 15000,
      })

      const $ = cheerio.load(html)
      const results = []

      $("table.table tbody tr").each((_, el) => {
        const td = $(el).find("td")
        if (td.length < 7) return

        results.push({
          waktu: $(td[1]).text().trim(),
          lintang: $(td[2]).text().trim(),
          bujur: $(td[3]).text().trim(),
          magnitudo: $(td[4]).text().trim(),
          kedalaman: $(td[5]).text().trim(),
          wilayah: $(td[6]).text().trim(),
        })
      })

      if (!results.length) {
        return res.status(404).json({
          status: false,
          message: "Data gempa tidak ditemukan",
        })
      }

      res.status(200).json({
        status: true,
        total: results.slice(0, limit).length,
        data: results.slice(0, limit),
        metadata: {
          source: "BMKG - Scraping",
          url: TARGET,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (err) {
      console.error("[Plugin Gempa Terkini]", err.message)

      res.status(500).json({
        status: false,
        message: "Gagal mengambil data gempa terkini",
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    }
  },
}
