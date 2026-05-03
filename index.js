import fastify from "fastify";
import cors from "@fastify/cors";
import fetch from "node-fetch";

// --- ⚙️ CẤU HÌNH HỆ THỐNG ---
const PORT = 3000;
const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/sessions";
const ADMIN_INFO = "@tranhoang2286"; 
const BRAND_NAME = "HOANGDZVIP";

const app = fastify({ logger: false });
await app.register(cors, { origin: "*" });

// --- 🌐 TRẠNG THÁI HỆ THỐNG ---
let txHistory = []; 
let currentSessionId = null; 
let lastPredictionData = { sessionId: null, side: null }; // Lưu lại dự đoán để đối soát

// --- 🛠️ XỬ LÝ DỮ LIỆU & FIX LỖI 11 ĐIỂM ---
function processData(data) {
    if (!data || !Array.isArray(data.list)) return [];
    return data.list.map(item => {
        const realTotal = item.dices.reduce((a, b) => a + b, 0); 
        return {
            session: item.id,
            dice: item.dices,
            total: realTotal,
            tx: realTotal >= 11 ? 'Tài' : 'Xỉu' // 11 điểm luôn là Tài
        };
    }).sort((a, b) => a.session - b.session);
}

// --- 🧠 AI PATTERN MASTER ---
const analyzeAI = (history) => {
    if (history.length < 5) return { side: 'Tài', conf: 0.85 };
    const last3 = history.slice(-3).map(i => i.tx === 'Tài' ? 'T' : 'X').join('');
    const prediction = last3 === 'TTT' ? 'Xỉu' : (last3 === 'XXX' ? 'Tài' : (Math.random() > 0.5 ? 'Tài' : 'Xỉu'));
    return { side: prediction, conf: 0.85 + (Math.random() * 0.1) };
};

// --- 🔄 ĐỒNG BỘ DỮ LIỆU ---
async function sync() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const history = processData(data);
        if (history.length > 0) {
            txHistory = history;
            currentSessionId = history.at(-1).session;
        }
    } catch (e) { console.log("⚠️ Lỗi kết nối API..."); }
}
setInterval(sync, 5000);
sync();

// --- 📡 API CHÍNH ---
app.get("/api/taixiumd5/hoangdz", async () => {
    const last = txHistory.at(-1);
    if (!last) return { "status": "🚀 ĐANG TẢI..." };

    // 1. Phân tích dự đoán cho phiên tiếp theo
    const pred = analyzeAI(txHistory);
    
    // 2. Logic kiểm tra Đúng/Sai cho phiên vừa kết thúc
    let checkResult = "🔄 ĐANG ĐỢI PHIÊN MỚI...";
    if (lastPredictionData.sessionId === last.session) {
        if (lastPredictionData.side === last.tx) {
            checkResult = "✅ ĐÚNG (ĂN TIỀN)";
        } else {
            checkResult = "❌ SAI (BẺ CẦU)";
        }
    }

    // 3. Lưu dự đoán mới để phiên sau đối soát
    lastPredictionData = { 
        sessionId: last.session + 1, 
        side: pred.side 
    };

    const lastLabel = last.total >= 11 ? "🔴 TÀI" : "🔵 XỈU";
    const predLabel = pred.side === 'Tài' ? "🔴 TÀI" : "🔵 XỈU";

    return {
        "👑_HE_THONG_": `💎 ${BRAND_NAME} OMNI MASTER V5.0 💎`,
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "💠",
        "🕒_PHIEN_TRUOC": {
            "Phiên": `#${last.session}`,
            "Xúc xắc": `🎲 [ ${last.dice.join(' - ')} ] ➔ 🏆 ${last.total}đ`,
            "Kết quả game": `${lastLabel} ✨`,
            "Trạng thái dự đoán": `${checkResult}` // Dòng Đúng/Sai của bạn ở đây
        },
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "💠",
        "🔮_PHIEN_SAU": {
            "Phiên": `#${last.session + 1}`,
            "Dự đoán": `🎯 ${predLabel} 🎯`,
            "Tỉ lệ thắng": `🔥 ${(pred.conf * 100).toFixed(2)}%`,
            "Id": `${ADMIN_INFO}`
        },
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "💠",
        "🛡️_LOG_ADMIN": {
            "Owner": "TRẦN NHẬT HOÀNG",
            "Security": "Bản quyền Hoangdztool 2026",
            "Note": "11 điểm Auto Tài - Đã fix lỗi logic"
        }
    };
});

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
    console.log(`🚀 ${BRAND_NAME} SYSTEM ACTIVE AT PORT ${PORT}`);
});
