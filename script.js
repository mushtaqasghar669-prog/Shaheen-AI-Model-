const langStrings = {
    ur: { load: "شاہین ڈیٹا ڈیکوڈ کر رہا ہے...", speak: "🔊 انسانی آواز میں سنیں", stop: "🛑 آواز روکیں" },
    en: { load: "Shaheen Scanning Global Nodes...", speak: "🔊 Listen Human Voice", stop: "🛑 Stop Voice" }
};

let synth = window.speechSynthesis;

function applyUI() {
    const l = document.getElementById('langSelect').value;
    const os = document.querySelector('.shaheen-ultimate-os');
    if(l === 'ur') os.classList.add('rtl'); else os.classList.remove('rtl');
}

async function masterDeepSearch() {
    const query = document.getElementById('mainSearch').value;
    const lang = document.getElementById('langSelect').value;
    const view = document.getElementById('results');
    if(!query) return;

    synth.cancel();
    view.innerHTML = `<div style="text-align:center; padding-top:100px;"><div class="loader-ring"></div><p>${langStrings[lang].load}</p></div>`;

    try {
        // ملٹی انجن سرچ - ہر ویب سائٹ سے ڈیٹا
        const [wikiRes, ddgRes] = await Promise.all([
            fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`).then(r => r.json()),
            fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`).then(r => r.json())
        ]);

        let combinedText = wikiRes.extract || ddgRes.AbstractText || "شاہین ویب سائٹس سے جواب تیار کر رہا ہے، براہ کرم سرچ کی بورڈ درست کریں۔";
        let mainImg = wikiRes.thumbnail ? wikiRes.thumbnail.source : (ddgRes.Image ? ddgRes.Image : "");

        let html = `<div class="data-result">`;
        if(mainImg) html += `<img src="${mainImg}" style="width:100%; border-radius:30px; margin-bottom:25px; border:2px solid var(--p);">`;
        
        html += `<h2 style="color:var(--p); font-size:32px; margin-bottom:15px;">${wikiRes.title || query}</h2>
                 <p id="textContent" style="font-size:22px; line-height:1.8; color:#eee;">${combinedText}</p>
                 
                 <button id="talkBtn" class="human-speak-btn" onclick="startHumanVoice()">
                    <i class="fas fa-volume-up"></i> ${langStrings[lang].speak}
                 </button>`;

        // ویب سائٹس کے لنکس (Google Style)
        if(ddgRes.RelatedTopics && ddgRes.RelatedTopics.length > 0) {
            html += `<div style="margin-top:40px; border-top:1px solid #222; padding-top:20px;"><h4 style="color:var(--p)">🌐 عالمی ویب سائٹس سے حاصل کردہ ڈیٹا:</h4>`;
            ddgRes.RelatedTopics.slice(0, 5).forEach(link => {
                if(link.FirstURL) html += `<div style="background:#111; padding:15px; border-radius:15px; margin-top:10px;"><a href="${link.FirstURL}" target="_blank" style="color:#00aaff; text-decoration:none; font-weight:bold;">🔗 ${link.Text.substring(0, 100)}...</a></div>`;
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        view.innerHTML = html;

    } catch (err) {
        view.innerHTML = "<p style='color:red;'>نیٹ ورک ایرر۔ شاہین ڈیٹا حاصل کرنے میں ناکام رہا۔</p>";
    }
}

// اصلی انسانی آواز کی سیٹنگ
function startHumanVoice() {
    const btn = document.getElementById('talkBtn');
    const lang = document.getElementById('langSelect').value;
    const text = document.getElementById('textContent').innerText;

    if (synth.speaking) {
        synth.cancel();
        btn.innerHTML = `<i class="fas fa-volume-up"></i> ${langStrings[lang].speak}`;
        btn.style.background = "linear-gradient(135deg, #00ffcc, #0088ff)";
    } else {
        const utter = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        
        // انسانی آواز کا انتخاب (Google Neural)
        let selectedVoice = voices.find(v => v.lang.includes(lang) && v.name.includes('Google')) || 
                           voices.find(v => v.lang.includes(lang)) || 
                           voices.find(v => v.lang.includes('hi'));

        utter.voice = selectedVoice;
        utter.rate = 0.85; // انسانی رفتار
        utter.pitch = 1.0;

        utter.onstart = () => {
            btn.innerHTML = `<i class="fas fa-stop"></i> ${langStrings[lang].stop}`;
            btn.style.background = "#ff0055";
            btn.style.color = "#fff";
        };
        utter.onend = () => {
            btn.innerHTML = `<i class="fas fa-volume-up"></i> ${langStrings[lang].speak}`;
            btn.style.background = "linear-gradient(135deg, #00ffcc, #0088ff)";
        };
        
        synth.speak(utter);
    }
}
applyUI();