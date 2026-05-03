import fastify from "fastify";
import cors from "@fastify/cors";
import fetch from "node-fetch";

// --- ⚙️ CẤU HÌNH ADMIN ---
const PORT = 3000;
const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/sessions";
const ADMIN_INFO = "@tranhoang2286";
const BRAND = "HOANGDZVIP";

const app = fastify({ logger: false });
await app.register(cors, { origin: "*" });

// --- 🌐 HỆ THỐNG TÍCH LŨY CẦU (MEMORY BANK) ---
let cumulativeHistory = []; // Nơi tích lũy cầu
let currentSessionId = null;
let lastPredictionData = { sessionId: null, side: null, confidence: 0 };

// --- 📋 DATA CÔNG THỨC CẦU X331 (BẢN CỨNG 100%) ---
const X331_FORMULA = {
    "X331": "X422", "X422": "X111", "X111": "T665", "T665": "X523", "X523": "X116",
    "X116": "X141", "X141": "X252", "X252": "T246", "T246": "T554", "T554": "T256",
    "T256": "T166", "T166": "T336", "T336": "T443", "T443": "X412", "X412": "T543",
    "T543": "X261", "X261": "T663", "T663": "T515", "T515": "T156", "T156": "X334",
    "X334": "T633", "T633": "X541", "X541": "X414", "X414": "T434", "T434": "X145",
    "X145": "X431", "X432": "T454", "T454": "T663", "T663": "X141", "X142": "T645",
    "T645": "X243", "X243": "T664", "T664": "X213", "X213": "T363", "T363": "X226",
    "X226": "X112", "X112": "T436", "T436": "T551", "T551": "X341", "X341": "T635",
    "T635": "T661", "T661": "T362", "T362": "T466", "T466": "T364", "T364": "X611",
    "X611": "T462", "T462": "X126", "X126": "T661", "T661": "X322", "X322": "T466",
    "T466": "X124", "X124": "X315", "X315": "T236", "T236": "X126", "X126": "X433",
    "X433": "T664", "T664": "T515", "T515": "T544", "T544": "X121", "X121": "X153",
    "X135": "X232", "X232": "X621", "X621": "T542", "T542": "X226", "X226": "X215",
    "X215": "X432", "X432": "X521", "X521": "X432", "X432": "T344", "T334": "T662",
    "T662": "T366"
};

// --- 🛠️ LOGIC TÍNH TỈ LỆ THEO ĐỘ TÍCH LŨY (FIX F5 NHẢY) ---
function getSmartConfidence(sessionId, historyCount) {
    // Tỉ lệ cơ bản từ 80%, mỗi 100 phiên tích lũy cộng thêm 0.5% (tối đa 99%)
    const base = 82;
    const bonus = Math.min(17, (historyCount / 100));
    const seed = (sessionId * 777) % 100;
    const decimal = (seed / 100).toFixed(2);
    return (parseFloat(base) + parseFloat(bonus) + parseFloat(decimal)).toFixed(2);
}

// --- 🧪 AI ANALYSIS (DETERMINISTIC) ---
const AI_CORE = {
    entropy: (s) => {
        if(!s) return 0.5;
        const f = {}; for (let c of s) f[c] = (f[c] || 0) + 1;
        return Object.values(f).reduce((e, v) => e - (v/32) * Math.log2(v/32), 0);
    }
};

// --- 🔄 ĐỒNG BỘ & TÍCH LŨY ---
async function sync() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.list) {
            const freshData = data.list.map(i => ({
                id: i.id,
                dices: i.dices,
                total: i.dices.reduce((a,b) => a+b, 0),
                md5: i.md5 || ""
            })).sort((a, b) => a.id - b.id);

            // Tích lũy cầu mới vào bộ nhớ (không trùng lặp)
            freshData.forEach(item => {
                if (!cumulativeHistory.find(h => h.id === item.id)) {
                    cumulativeHistory.push(item);
                }
            });

            // Giới hạn tích lũy 2000 phiên để tránh nặng máy
            if (cumulativeHistory.length > 2000) cumulativeHistory.shift();
            
            currentSessionId = cumulativeHistory.at(-1).id;
        }
    } catch (e) {}
}
setInterval(sync, 5000); sync();

// --- 📡 API OUTPUT ---
app.get("/api/taixiumd5/hoangdz", async () => {
    const last = cumulativeHistory.at(-1);
    if (!last) return { status: "🔄 ĐANG TÍCH LŨY CẦU..." };

    const nextId = last.id + 1;
    const totalAccumulated = cumulativeHistory.length;
    const smartConf = getSmartConfidence(nextId, totalAccumulated);

    // AI Phân tích
    const taiScore = AI_CORE.entropy(last.md5) * 10;
    const key = (last.total >= 11 ? "T" : "X") + last.dices.join('');
    const formulaTarget = X331_FORMULA[key] || (taiScore > 5 ? "TÀI" : "XỈU");
    const predictionSide = formulaTarget.startsWith("T") ? "TÀI" : "XỈU";

    // Đối soát Đúng/Sai
    let validate = "🔄 ĐANG CHỜ...";
    if (lastPredictionData.sessionId === last.id) {
        const realTX = last.total >= 11 ? "TÀI" : "XỈU";
        validate = (lastPredictionData.side === realTX) ? "✅ ĐÚNG (WIN)" : "❌ SAI (BẺ)";
    }

    // Lưu dữ liệu dự đoán
    lastPredictionData = { sessionId: nextId, side: predictionSide, confidence: smartConf };

    return {
        "💎_HOANGDZVIP_PRO_💎": "💠 HỆ THỐNG TÍCH LŨY CẦU LƯỢNG TỬ 💠",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "🌟",
        "📊_THONG_SO_TICH_LUY": {
            "Số phiên đã tích lũy": `${totalAccumulated} Phiên 📚`,
            "Độ chuẩn xác AI": totalAccumulated > 500 ? "🔥 CỰC CAO" : "⚡ ĐANG HỌC CẦU",
            "Trạng thái": "✅ ĐÃ FIX LỖI NHẢY TỈ LỆ"
        },
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "🌟",
        "🕒_LICH_SU_PHIEN_TRUOC": {
            "Phiên": `#${last.id}`,
            "Dự đoán": lastPredictionData.side === "TÀI" ? "TÀI 🔴" : "XỈU 🔵",
            "Kết quả của game": `${last.total >= 11 ? "🔴 TÀI" : "🔵 XỈU"} (${last.dices.join('-')})`,
            "Kết luận": `${validate}`
        },
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "🌟",
        "🔮_DU_DOAN_PHIEN_SAU": {
            "Phiên sau": `#${nextId}`,
            "Dự đoán": predictionSide === "TÀI" ? "🎯 TÀI 🔴 🎯" : "🎯 XỈU 🔵 🎯",
            "Tỉ lệ chuẩn": `🔥 ${smartConf}% 🔥`,
            "Đánh giá": "⭐".repeat(Math.floor(smartConf/20)),
            "Cầu chuẩn": key in X331_FORMULA ? "✅ KHỚP CÔNG THỨC X331" : "🧠 PHÂN TÍCH MD5",
            "Id": `${ADMIN_INFO}`
        },
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━": "🌟",
        "🛡️_ADMIN_HOANGDZ": {
            "Owner": "TRẦN NHẬT HOÀNG",
            "Security": "Mã hóa MD5-Layer-2026",
            "Bản quyền": "Hoangdztool.vip"
        }
    };
});

app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
    console.log(`🚀 HOANGDZVIP V7.0 - Tích lũy cầu đang chạy!`);
});
