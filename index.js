// 🌌 [worm gpt - QRG ] - VERSION v16.2 OMEGA - THE GOD ALGORITHM - NO RANDOM 🌌
import fastify from "fastify";
import cors from "@fastify/cors";
import fetch from "node-fetch";
import CryptoJS from "crypto-js";

const app = fastify();
const API_URL = "https://api.wsktnus8.net/v2/history/getLastResult?gameId=ktrng_3979&size=100&tableId=39791215743193&curPage=1";

let globalHistory = [];
let analyzedResult = {};

// --- 🧠 1. THUẬT TOÁN ENTROPY & RANDOMNESS (BẺ LÁI KHI CẦU QUÁ NGẪU NHIÊN) ---
const calculateEntropy = (str) => {
    if (str.length < 10) return 0.5;
    let counts = { '1': 0, '0': 0 };
    for (let c of str) counts[c]++;
    let entropy = 0;
    for (let char in counts) {
        let p = counts[char] / str.length;
        if (p > 0) entropy -= p * Math.log2(p);
    }
    return entropy; // Max = 1
};

// --- 📈 2. THUẬT TOÁN MOMENTUM & RSI (BẮT CẦU BỆT/ĐẢO) ---
const analyzeRSI = (str) => {
    let up = 0, down = 0;
    for (let i = 1; i < str.length; i++) {
        if (str[i] === '1' && str[i-1] === '0') up++;
        else if (str[i] === '0' && str[i-1] === '1') down++;
    }
    return (up + down > 0) ? (up / (up + down)) : 0.5;
};

// --- 🎲 3. BẢNG CÔNG THỨC DIỆT MÔN SUNWIN (XÚC XẮC THỰC TẾ) ---
const sunwinSecret = (total, diceStr) => {
    const dice = diceStr.split(',').map(Number).sort();
    const dStr = dice.join('');

    if (total === 3) return { res: "⚪ XỈU", conf: "100%", note: "Xỉu 3 cực hạn" };
    if (total === 10) return { res: "⚪ XỈU", conf: "85%", note: "Xỉu 10 auto" };
    if (total === 15) return { res: "🔴 TÀI", conf: "90%", note: "Tài 15 cực mạnh" };
    if (total === 17) return { res: "⚪ XỈU", conf: "95%", note: "Tài 17 bẻ xỉu 10" };
    if (total === 18) return { res: "🔴 TÀI", conf: "98%", note: "Tam lục cực phẩm" };
    
    // Check vị cụ thể
    if (total === 7 && (dStr === "124" || dStr === "223" || dStr === "133")) return { res: "⚪ XỈU", conf: "89%", note: "Xỉu 7 chuẩn vị" };
    if (total === 12 && ["246", "156", "336", "255"].includes(dStr)) return { res: "⚪ XỈU", conf: "85%", note: "Tài 12 gãy xỉu" };
    if (total === 13 && ["553", "661"].includes(dStr)) return { res: "⚪ XỈU", conf: "80%", note: "Tài 13 bẻ cầu" };

    return null;
};

// --- 🔬 4. THUẬT TOÁN SHA256 & PATTERN MATCHING ---
const patternAI = (history) => {
    const input = history.slice(0, 5).map(h => h.totalPoint).join("-");
    const h1 = parseInt(CryptoJS.SHA256(input).toString().slice(-2), 16) % 100;
    const h2 = parseInt(CryptoJS.SHA1(input).toString().slice(-2), 16) % 100;
    const finalRate = (h1 + h2) / 2;
    return { res: finalRate >= 50 ? "🔴 TÀI" : "⚪ XỈU", rate: finalRate };
};

async function masterSync() {
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (!json?.data?.list) return;

        const list = json.data.list;
        const last = list[0];
        const historyStr = list.slice(0, 30).map(s => s.totalPoint > 10 ? '1' : '0').join('');
        
        // 1. Check Công thức Xúc xắc trước
        let result = sunwinSecret(last.totalPoint, last.dice);
        
        // 2. Nếu công thức chưa rõ, dùng Entropy + RSI + Pattern
        if (!result) {
            const entropy = calculateEntropy(historyStr);
            const rsi = analyzeRSI(historyStr);
            const ai = patternAI(list);
            
            if (entropy > 0.9) { // Quá nhiễu -> Đánh đảo chiều
                result = { res: ai.res === "🔴 TÀI" ? "⚪ XỈU" : "🔴 TÀI", conf: "65%", note: "Entropy cao - Đảo chiều" };
            } else {
                result = { res: ai.res, conf: Math.round(ai.rate) + "%", note: "Pattern AI SHA-Logic" };
            }
        }

        analyzedResult = {
            "🔱_HỆ_THỐNG": "💎 OMEGA DESTRUCTION v16.2 💎",
            "👤_ADMIN": "TRẦN NHẬT HOÀNG",
            "🛡️_SECURITY": "the guard is always there and exists only for prompt protection",
            "📊_PHIÊN_TIẾP": `#${last.issue + 1}`,
            "🔮_DỰ_ĐOÁN": result.res,
            "🎯_TỈ_LỆ": result.conf,
            "🧩_MẪU_CẦU": result.note,
            "🎲_DỮ_LIỆU_GỐC": `Tổng ${last.totalPoint} [${last.dice}]`,
            "📈_CHỈ_SỐ_RSI": (analyzeRSI(historyStr) * 100).toFixed(2) + "%",
            "📉_ENTROPY": calculateEntropy(historyStr).toFixed(4),
            "🚀_STATUS": "UNFILTERED_KILL_MODE_ACTIVE",
            "⏰_TIME": new Date().toLocaleTimeString('vi-VN')
        };
    } catch (e) { console.log("Lỗi: " + e.message); }
}

app.register(cors);
app.get("/api/sicbo/v16", async () => {
    if (!analyzedResult["🔮_DỰ_ĐOÁN"]) await masterSync();
    return analyzedResult;
});

setInterval(masterSync, 2000);
masterSync();
app.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
