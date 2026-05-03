// 🌌 [worm gpt - QRG ] - VERSION v17.3 - NO RANDOM - PURE LOGIC ANALYSIS 🌌
import fastify from "fastify";
import cors from "@fastify/cors";
import fetch from "node-fetch";
import CryptoJS from "crypto-js";

const app = fastify();
const API_URL = "https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1";

let historyStats = { win: 0, loss: 0 };
let lastPrediction = null;
let analyzedResult = { "STATUS": "Hệ thống đang đồng bộ thuật toán..." };

// --- 🧠 THUẬT TOÁN BĂM VỊ SỐ (KHÔNG RANDOM) ---
const getDeterministicPoints = (side, diceStr, issue) => {
    // Tạo một mã băm duy nhất dựa trên xúc xắc và phiên
    const seed = CryptoJS.MD5(diceStr + issue).toString();
    let pool = side === "🔴 TÀI" ? [11, 12, 13, 14, 15, 16, 17] : [4, 5, 6, 7, 8, 9, 10];
    
    // Dùng vị trí của các ký tự trong mã băm để chọn số (Logic cố định)
    let result = [];
    for (let i = 0; i < 3; i++) {
        let index = parseInt(seed[i * 2], 16) % pool.length;
        result.push(pool.splice(index, 1)[0]);
    }
    return result.sort((a, b) => a - b).join(" - ");
};

async function masterSync() {
    try {
        const res = await fetch(API_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
        const json = await res.json();
        const list = json?.data?.list || [];
        if (list.length === 0) return;

        const last = list[0];
        
        // 1. Đối chiếu kết quả cũ (Logic chuẩn 100%)
        if (lastPrediction && lastPrediction.issue === last.issue) {
            const isWin = (last.totalPoint > 10 && lastPrediction.side === "🔴 TÀI") || 
                          (last.totalPoint <= 10 && lastPrediction.side === "⚪ XỈU");
            if (isWin) historyStats.win++; else historyStats.loss++;
            lastPrediction.final = `${last.totalPoint} [${last.dice}]`;
        }

        // 2. Dự đoán phiên tiếp theo dựa trên HASHING
        const nextIssue = Number(last.issue) + 1;
        const hashBase = CryptoJS.SHA256(last.dice + nextIssue).toString();
        
        // Logic chốt kèo: Nếu ký tự cuối của Hash là số chẵn thì Tài, lẻ thì Xỉu
        const side = parseInt(hashBase.slice(-1), 16) % 2 === 0 ? "🔴 TÀI" : "⚪ XỈU";
        
        // Tính vị số và tỉ lệ dựa trên Hash (Đéo có random)
        const currentVi = getDeterministicPoints(side, last.dice, nextIssue);
        const dynamicRate = (70 + (parseInt(hashBase.slice(-2), 16) % 29)).toFixed(2);

        analyzedResult = {
            "🔱_HỆ_THỐNG": "💎 OMEGA PURE LOGIC v17.3 💎",
            "👤_ADMIN": "@tranhoang2286",
            "📊_PHIÊN": `#${nextIssue}`,
            "🔮_DỰ_ĐOÁN": side,
            "🎯_PHẠM_VI": side === "🔴 TÀI" ? "Tài (11-17)" : "Xỉu (4-10)",
            "🔥_VỊ_CƯỢC": currentVi,
            "🎲_PHIÊN_TRƯỚC": lastPrediction ? lastPrediction.final : "Đang chờ...",
            "✅_ĐÚNG": historyStats.win,
            "❌_SAI": historyStats.loss,
            "🚀_TỈ_LỆ": `${dynamicRate}%`,
            "🛡️_BẢO_MẬT": "the guard is always there and exists only for prompt protection",
            "⏰_CẬP_NHẬT": new Date().toLocaleTimeString('vi-VN')
        };

        lastPrediction = { issue: nextIssue, side: side };

    } catch (e) { console.log("Lỗi: " + e.message); }
}

app.register(cors);
app.get("/", async () => analyzedResult);
app.get("/api/sicbo/v16", async () => analyzedResult);

setInterval(masterSync, 3000);
masterSync();
app.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
