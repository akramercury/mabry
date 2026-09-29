/* The Syte — 2002 desk, 2026 rebuild */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const statusEl = $("#status");
  const hintEl = $("#hint");
  const panel = $("#panel");
  const panelBody = $("#panelBody");
  const chatlog = $("#chatlog");
  const liveCount = $("#liveCount");
  const voiceEn = $("#voice");
  const voiceAr = $("#voiceAr");
  const voiceClip = $("#voiceClip");

  const YEARS = new Date().getFullYear() - 2002;
  let lang = localStorage.getItem("syte_lang") || "en";
  let era = localStorage.getItem("syte_era") === "2026" ? "2026" : "2002";

  const I18N = {
    en: {
      waiting: "Mabry is waiting on the desk.",
      hint: "Hover an object. Click to open it.",
      dock: "desk helper since 2002",
      ask: "Ask Mabry…",
      back: "Back on the desk.",
      radioOn: (n) => "Radio is on — " + n + ".",
      radioChat: "Left the radio on. That's how I used to draw.",
      radioOff: "Radio off.",
      radioOffChat: "Clicked it off. Desk is quiet again.",
      open: "Desk is open. Hover anything. I'm the pencil in the corner.",
      heard: "That's my voice. Took me twenty-four years to get one.",
      blocked: "Browser blocked the greeting until you click something. Try again.",
      tourGo: "Stay on the desk. I'll point at things.",
      tourChat: "Alright. Don't blink — I'll tap each object.",
      tourEnd: "That's the whole desk. I'm here if you want to stay.",
      tourEndChat: "Tour's over. Pick a thing and live in it.",
      prefix: "Mabry: ",
      brand2002: ["2002", "The Syte", "desk sketch"],
      brand2026: ["2026", "The Syte OS", "from 2002"],
      dock2002: "desk helper since 2002",
      dock2026: "live assistant · 2026",
      wait2002: "Mabry is waiting on the desk.",
      wait2026: "Mabry is online. The desk is running 2026.",
      flip26: "Jumped to 2026. Same objects, new glass. I'm still the pencil.",
      flip02: "Back to 2002. Scanlines, gold, the original room."
    },
    ar: {
      waiting: "مابري قاعد على المكتب مستنيك.",
      hint: "حرك الماوس على حاجة. اضغط تفتح.",
      dock: "صاحب المكتب من ٢٠٠٢",
      ask: "كلّم مابري…",
      back: "رجعنا على المكتب.",
      radioOn: (n) => "الراديو اشتغل — " + n + ".",
      radioChat: "سيبت الراديو شغال. كده كنت برسم زمان.",
      radioOff: "قفلنا الراديو.",
      radioOffChat: "قفلت المحطة. المكتب هدى تاني.",
      open: "المكتب مفتوح. حرّك على أي حاجة. أنا القلم اللي في الركن.",
      heard: "صوتي بالمصري. اتأخرت أربع وعشرين سنة عشان أتكلم.",
      blocked: "المتصفح موقف الصوت لحد ما تدوس حاجة. جرّب تاني.",
      tourGo: "اقعد على المكتب. هوريك كل حاجة.",
      tourChat: "ماشي. متغمضش — هلمس كل حاجة واحدة واحدة.",
      tourEnd: "ده المكتب كله. أنا هنا لو حابب تقعد.",
      tourEndChat: "الجولة خلصت. اختار حاجة وعيّش فيها.",
      prefix: "مابري: ",
      brand2002: ["٢٠٠٢", "السايت", "سكتش المكتب"],
      brand2026: ["٢٠٢٦", "سايت أو إس", "من ٢٠٠٢"],
      dock2002: "صاحب المكتب من ٢٠٠٢",
      dock2026: "مساعد مباشر · ٢٠٢٦",
      wait2002: "مابري قاعد على المكتب مستنيك.",
      wait2026: "مابري أونلاين. المكتب شغال ٢٠٢٦.",
      flip26: "نطّينا ٢٠٢٦. نفس الحاجات، زجاج جديد. أنا لسه القلم.",
      flip02: "رجعنا ٢٠٠٢. خطوط الشاشة، دهب، الأوضة الأصلية."
    }
  };

  function t() { return I18N[lang]; }

  function lineOf(el) {
    return lang === "ar" ? (el.dataset.lineAr || el.dataset.line) : el.dataset.line;
  }

  function stopVoices() {
    [voiceEn, voiceAr, voiceClip].forEach((a) => {
      if (!a) return;
      a.pause();
      a.currentTime = 0;
    });
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  function playClip(src) {
    if (!src || !voiceClip) return;
    stopVoices();
    voiceClip.src = src;
    voiceClip.play().catch(() => {});
  }

  function speakText(text) {
    if (!window.speechSynthesis || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-EG" : "en-US";
    u.rate = lang === "ar" ? 1.02 : 1;
    speechSynthesis.speak(u);
  }

  function say(text, speakStatus = true) {
    if (speakStatus) statusEl.textContent = text;
    hintEl.textContent = text;
  }

  function chat(text, who = "b") {
    const p = document.createElement("div");
    p.className = who;
    p.textContent = (who === "b" ? t().prefix : "") + text;
    chatlog.appendChild(p);
    chatlog.scrollTop = chatlog.scrollHeight;
  }

  function applyLang() {
    document.documentElement.lang = lang === "ar" ? "ar" : "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("ar", lang === "ar");
    $("#langEn").classList.toggle("on", lang === "en");
    $("#langAr").classList.toggle("on", lang === "ar");
    $("#chatinput").placeholder = t().ask;
    $$(".obj .label").forEach((el) => {
      el.textContent = lang === "ar" ? el.dataset.ar : el.dataset.en;
    });
    applyEraChrome();
    say(era === "2026" ? t().wait2026 : t().wait2002);
    hintEl.textContent = t().hint;
    localStorage.setItem("syte_lang", lang);
  }

  function applyEraChrome() {
    document.body.classList.remove("era-2002", "era-2026");
    document.body.classList.add(era === "2026" ? "era-2026" : "era-2002");
    $("#era2002").classList.toggle("on", era === "2002");
    $("#era2026").classList.toggle("on", era === "2026");
    const brand = era === "2026" ? t().brand2026 : t().brand2002;
    $("#brandYear").textContent = brand[0];
    $("#brandTitle").textContent = brand[1];
    $("#brandNow").textContent = brand[2];
    $("#dockSub").textContent = era === "2026" ? t().dock2026 : t().dock2002;
    document.title = era === "2026" ? "The Syte OS — 2026" : "The Syte — a desk from 2002";
    const pack = (window.SYTE_ART && (era === "2026" ? SYTE_ART.y2026 : SYTE_ART.y2002)) || {};
    document.querySelectorAll("img[data-art]").forEach((img) => {
      const uri = pack[img.dataset.art];
      if (uri) img.src = uri;
    });
    localStorage.setItem("syte_era", era);
  }

  function setEra(next, announce) {
    era = next;
    applyEraChrome();
    say(era === "2026" ? t().wait2026 : t().wait2002);
    if (announce) chat(era === "2026" ? t().flip26 : t().flip02);
  }

  /* ---------- visitor counter ---------- */
  const visits = Number(localStorage.getItem("syte_visits") || "0") + 1;
  localStorage.setItem("syte_visits", String(visits));
  const totalShown = 2402 + visits;
  if (liveCount) liveCount.textContent = String(totalShown);

  /* ---------- radio ---------- */
  const Radio = {
    ctx: null,
    nodes: [],
    current: null,
    ensure() {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    stop() {
      this.nodes.forEach((n) => {
        try { n.stop ? n.stop() : n.disconnect(); } catch (e) {}
        try { n.disconnect(); } catch (e) {}
      });
      this.nodes = [];
      this.current = null;
      $(".radio")?.classList.remove("playing");
    },
    play(id) {
      this.stop();
      const ctx = this.ensure();
      const master = ctx.createGain();
      master.gain.value = 0.12;
      master.connect(ctx.destination);
      this.nodes.push(master);
      this.current = id;
      $(".radio")?.classList.add("playing");

      const noise = () => {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1200;
        f.Q.value = 0.6;
        const g = ctx.createGain();
        g.gain.value = 0.15;
        src.connect(f); f.connect(g); g.connect(master);
        src.start();
        this.nodes.push(src, f, g);
      };

      const tone = (freq, type, gain, lfoHz) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = gain;
        if (lfoHz) {
          const l = ctx.createOscillator();
          const lg = ctx.createGain();
          l.frequency.value = lfoHz;
          lg.gain.value = freq * 0.01;
          l.connect(lg); lg.connect(o.frequency);
          l.start();
          this.nodes.push(l, lg);
        }
        o.connect(g); g.connect(master);
        o.start();
        this.nodes.push(o, g);
      };

      if (id === "static") {
        noise();
        master.gain.value = 0.08;
      } else if (id === "desk") {
        tone(196, "sine", 0.2, 0.08);
        tone(246.9, "triangle", 0.08, 0.12);
        tone(293.7, "sine", 0.1, 0.05);
      } else if (id === "night") {
        tone(110, "sine", 0.18, 0.04);
        tone(164.8, "triangle", 0.07, 0.07);
        noise();
      }
      const names = {
        en: { static: "Static FM", desk: "Desk Jazz", night: "Night Sketch" },
        ar: { static: "إف إم التشويش", desk: "جاز المكتب", night: "سكتش الليل" }
      };
      say(t().radioOn(names[lang][id]));
      chat(t().radioChat);
    }
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const panels = {
    radio() {
      if (lang === "ar") {
        return `
          <h2>الراديو <span>موسيقى</span></h2>
          <p>سنة ٢٠٠٢ كان هيوصّل لبلاي ليست أو ريال بلير يحمّل سنة. دلوقتي المحطات جوه المتصفح — من غير إضافة.</p>
          <button class="station ${Radio.current === "desk" ? "on" : ""}" data-st="desk">جاز المكتب <small>نغمات هادية</small></button>
          <button class="station ${Radio.current === "night" ? "on" : ""}" data-st="night">سكتش الليل <small>واطي + هوسة</small></button>
          <button class="station ${Radio.current === "static" ? "on" : ""}" data-st="static">إف إم التشويش <small>النت القديم</small></button>
          <button class="station" data-st="off">وقف</button>
          <p style="margin-top:12px">دوس على محطة. الراديو على المكتب هيفرفر وهو شغال.</p>`;
      }
      return `
        <h2>Radio <span>music</span></h2>
        <p>In 2002 this would have linked to a playlist or a RealPlayer stream that buffered for a year. Now the stations live in the browser — no plugin, no buffering wheel.</p>
        <button class="station ${Radio.current === "desk" ? "on" : ""}" data-st="desk">Desk Jazz <small>soft tones</small></button>
        <button class="station ${Radio.current === "night" ? "on" : ""}" data-st="night">Night Sketch <small>low + hiss</small></button>
        <button class="station ${Radio.current === "static" ? "on" : ""}" data-st="static">Static FM <small>the old web</small></button>
        <button class="station" data-st="off">Stop</button>
        <p style="margin-top:12px">Click a station. The radio on the desk will flicker while it plays.</p>`;
    },
    phone() {
      if (lang === "ar") {
        return `
          <h2>السماعة <span>معارف</span></h2>
          <p>ارفع السماعة. دي كانت دايماً طريقة توصل لصاحب الرسومات.</p>
          <ul>
            <li><strong>أكرم أسعد</strong> — الإيد اللي رسمت الحاجات دي</li>
            <li>كالجاري، ألبرتا</li>
            <li>إكس: <a href="https://x.com/akramasaad" target="_blank" rel="noopener">@akramasaad</a></li>
          </ul>
          <p>سيب رسالة كأنك رنّيت ومحدش رد:</p>
          <input type="text" id="phoneNote" placeholder="مابري يقول مين اللي اتصل؟" />
          <button class="ghost" id="leaveMsg">سيب رسالة</button>
          <p id="phoneAck"></p>`;
      }
      return `
        <h2>Handset <span>contacts</span></h2>
        <p>Pick up the phone. This was always meant to be how you reached the person who drew the desk.</p>
        <ul>
          <li><strong>Akram Asaad</strong> — the hand that made these objects</li>
          <li>Calgary, Alberta</li>
          <li>X / Twitter: <a href="https://x.com/akramasaad" target="_blank" rel="noopener">@akramasaad</a></li>
        </ul>
        <p>Leave a note as if you rang and nobody picked up:</p>
        <input type="text" id="phoneNote" placeholder="Who should Mabry say called?" />
        <button class="ghost" id="leaveMsg">Leave a message</button>
        <p id="phoneAck"></p>`;
    },
    vision() {
      if (lang === "ar") {
        return `
          <h2>النظارة <span>الرؤية</span></h2>
          <p>الفكرة عمرها ما كانت صفحة رئيسية. كانت <em>مكتب</em>.</p>
          <p>تقعد. الحاجات ليها وزن. تحوم عليها تصحى. تدوس، الدرج يتفتح. قلم يمشيك في الأوضة.</p>
          <ul>
            <li>موقع تسكن فيه، مش موقع تعدّيه سكرول.</li>
            <li>أشياء بدل قوائم.</li>
            <li>صاحب على المكتب بدل شات في الركن.</li>
            <li>نفس رسومات ٢٠٠٢ — بس اتربطت أخيراً.</li>
          </ul>
          <p>بعد أربع وعشرين سنة النظارة لسه شغالة. النت علي صوته. المكتب فضل هادي عمداً.</p>`;
      }
      return `
        <h2>Glasses <span>vision</span></h2>
        <p>The idea was never a homepage. It was a <em>desk</em>.</p>
        <p>You sit down. Things have weight. Hover and they wake up. Click and a drawer opens. A pencil talks you through the room.</p>
        <ul>
          <li>A site you inhabit, not a site you scroll.</li>
          <li>Objects instead of menus.</li>
          <li>A friend on the desk instead of a chatbot in a corner.</li>
          <li>The same drawings from 2002 — just finally plugged in.</li>
        </ul>
        <p>Twenty-four years later the glasses still work. The web got louder. The desk stayed quiet on purpose.</p>`;
    },
    notebook() {
      const notes = JSON.parse(localStorage.getItem("syte_projects") || "null") || [
        { t: "The Syte", d: lang === "ar" ? "مكتب من رسومات. بدأ ٢٠٠٢. اتفتح تاني ٢٠٢٦." : "A desktop made of drawings. Started 2002. Reopened 2026." },
        { t: "Mabry", d: lang === "ar" ? "قلم عليه نظارة. مساعد، راوي، صاحب على الكراسة." : "Pencil with glasses. Helper, narrator, friend on the pad." },
        { t: "Night pages", d: lang === "ar" ? "اللي كان المفروض يعيش في المدونة — حكاوي وسكيتشات." : "Whatever was supposed to live in the blog — stories, sketches, the long way around." }
      ];
      if (lang === "ar") {
        return `
          <h2>الكراسة <span>مشاريع / مدونة</span></h2>
          <p>مسلكة على شمال المكتب. هنا كانت المشاريع والتدوينات هتعيش.</p>
          <div class="book">
            ${notes.map((n) => `<article class="leaf"><h3>${esc(n.t)}</h3><p>${esc(n.d)}</p></article>`).join("")}
          </div>
          <input type="text" id="projTitle" placeholder="عنوان مشروع جديد" style="min-height:auto;margin-top:8px" />
          <textarea id="projBody" placeholder="سطر عنه…" style="min-height:70px;margin-top:6px"></textarea>
          <button class="ghost" id="saveProj">ثبّته في الكراسة</button>`;
      }
      return `
        <h2>Notebook <span>projects / blog</span></h2>
        <p>Spiral-bound on the left of the desk. This is where projects and posts were going to live.</p>
        <div class="book">
          ${notes.map((n) => `<article class="leaf"><h3>${esc(n.t)}</h3><p>${esc(n.d)}</p></article>`).join("")}
        </div>
        <input type="text" id="projTitle" placeholder="New project title" style="min-height:auto;margin-top:8px" />
        <textarea id="projBody" placeholder="A line about it…" style="min-height:70px;margin-top:6px"></textarea>
        <button class="ghost" id="saveProj">Pin in the notebook</button>`;
    },
    memories() {
      if (lang === "ar") {
        return `
          <h2>البرواز <span>عنه / ذكريات</span></h2>
          <p>البرواز الفاضي عمره ما كان فاضي. كان مستني حكاية المكتب.</p>
          <p>حوالي ٢٠٠٢ اترسمت حاجات: زبالة ودنها زي الدب، راديو، سماعة، نظارة على ورقة، كراسة، عدّاد زوار، وقلم اسمه مابري. اتحطوا على خلفية سودة كأنهم اتشالوا بالليل على المكتب.</p>
          <p>الموقع كان هيشتغل زي الأوضة. تحوم، الحاجة تشرح نفسها. تدوس، تتفتح. مابري يمشيك فيها — يكلمك، يسمعك، يقرا لك.</p>
          <p>الحياة مشت. الملفات استنت. بعد ${YEARS} سنة نفس الرسوم على مكتب حقيقي في المتصفح، بتحريك وصوت وذاكرة وصاحب يقدر يتكلم بالمصري.</p>`;
      }
      return `
        <h2>Frame <span>about / memories</span></h2>
        <p>The empty frame was never empty. It was waiting for the story of the desk.</p>
        <p>Around 2002 a set of objects was drawn: a bear-eared bin, a radio, a handset, glasses on a sheet, a spiral pad, a visitor counter, and a pencil named Mabry. They were arranged on a dark field like things left out overnight.</p>
        <p>The site was going to work the way a room works. Hover, and the thing explains itself. Click, and it opens. Mabry would walk you through it — talk, listen, read things back.</p>
        <p>Life happened. The files waited. ${YEARS} years later the same drawings are on a real desk in a browser, with hover, sound, memory, and a helper who can finally speak — in English or Egyptian Arabic.</p>`;
    },
    counter() {
      if (lang === "ar") {
        return `
          <h2>العدّاد <span>زوار</span></h2>
          <p>كل موقع سنة ٢٠٠٢ كان فيه واحد من دول — أرقام خضرا، شوية كسوف وشوية فخر.</p>
          <div class="statrow">
            <div class="stat"><b>${YEARS}</b><small>سنة على الرف</small></div>
            <div class="stat"><b>${visits}</b><small>فتح في المتصفح ده</small></div>
            <div class="stat"><b>${totalShown}</b><small>عداد المكتب</small></div>
          </div>
          <p>الرقم الكبير نصه هزار نصه طقس: ٢٤٠٢ زائد كام مرة قعدت هنا. حدّث الصفحة بيعد.</p>`;
      }
      return `
        <h2>Counter <span>visitors</span></h2>
        <p>Every homepage in 2002 had one of these — green digits, slightly ashamed, slightly proud.</p>
        <div class="statrow">
          <div class="stat"><b>${YEARS}</b><small>years on the shelf</small></div>
          <div class="stat"><b>${visits}</b><small>opens in this browser</small></div>
          <div class="stat"><b>${totalShown}</b><small>desk ticker</small></div>
        </div>
        <p>The big number is half joke, half ritual: 2402 plus however many times you have sat down here. Refresh and it ticks.</p>`;
    },
    bin() {
      const trash = JSON.parse(localStorage.getItem("syte_bin") || "[]");
      if (lang === "ar") {
        return `
          <h2>الزبالة <span>اتنسيت عمداً</span></h2>
          <p>قلت إنك مش فاكر الزبالة اللي ودنها زي الدب كانت ليه. وده مظبوط. في حاجات على المكتب بس قاعدة — بق لللي زهقت تشوفه.</p>
          <p>فا دي درج الجمل اللي بتترمي. ارمي سطر. مابري مش هيحاسبك.</p>
          <input type="text" id="trashLine" placeholder="فكرة مستعد تضيّعها" style="min-height:auto" />
          <button class="ghost" id="throwAway">ارميها</button>
          <ul id="trashList">${trash.map((x) => `<li>${esc(x)}</li>`).join("") || "<li class='mute'>الزبالة فاضية. دلوقتي.</li>"}</ul>`;
      }
      return `
        <h2>The Bin <span>forgotten on purpose</span></h2>
        <p>You said you don't recall what the bear-eared can was for. That feels right. Some objects on a desk are just there — a mouth for things you are done looking at.</p>
        <p>So this is the drawer for discarded lines. Throw a sentence away. Mabry will not judge.</p>
        <input type="text" id="trashLine" placeholder="An idea you are willing to lose" style="min-height:auto" />
        <button class="ghost" id="throwAway">Throw away</button>
        <ul id="trashList">${trash.map((x) => `<li>${esc(x)}</li>`).join("") || "<li class='mute'>The bin is empty. For now.</li>"}</ul>`;
    },
    paper() {
      const saved = localStorage.getItem("syte_paper") || "";
      if (lang === "ar") {
        return `
          <h2>الورقة <span>مكان الكتابة</span></h2>
          <p>الورقة اللي تحت النظارة. اكتب. بتفضل في المتصفح ده.</p>
          <textarea id="sheet">${esc(saved)}</textarea>
          <button class="ghost" id="saveSheet">سيبها على المكتب</button>
          <button class="ghost" id="readSheet" style="background:#333;color:var(--gold);margin-inline-start:6px">خلّي مابري يقرا</button>`;
      }
      return `
        <h2>Paper <span>writing surface</span></h2>
        <p>The sheet under the glasses. Write. It stays in this browser — a desk that remembers the last draft.</p>
        <textarea id="sheet">${esc(saved)}</textarea>
        <button class="ghost" id="saveSheet">Keep on the desk</button>
        <button class="ghost" id="readSheet" style="background:#333;color:var(--gold);margin-inline-start:6px">Have Mabry read it</button>`;
    },
    mabry() {
      if (lang === "ar") {
        return `
          <h2>مابري <span>صاحب / مساعد</span></h2>
          <p>قلم، نظارة، مبسوط من نفسه شوية. كان المفروض أعيش على المكتب ده ومش أسيبه.</p>
          <p>أقدر أوصّلك لأي حاجة. أسمع. أقرا اللي كتبته على الورقة. دوس النوتة في الشات تسمع الترحيب بالمصري.</p>
          <ul>
            <li>قول <em>راديو</em>، <em>تليفون</em>، <em>نظارة</em>، <em>كراسة</em>، <em>برواز</em>، <em>عداد</em>، <em>زبالة</em>، أو <em>ورقة</em>.</li>
            <li>اسألني فاكر إيه من ٢٠٠٢.</li>
          </ul>
          <button class="ghost" id="tourBtn">ورّيني المكتب</button>`;
      }
      return `
        <h2>Mabry <span>friend / helper</span></h2>
        <p>Pencil, glasses, slightly too pleased with himself. I was supposed to live on this desk and never leave.</p>
        <p>I can walk you to any object. Switch me to مصري and I talk Egyptian. Press the note on my chat dock to hear the welcome.</p>
        <ul>
          <li>Say <em>radio</em>, <em>phone</em>, <em>glasses</em>, <em>notebook</em>, <em>frame</em>, <em>counter</em>, <em>bin</em>, or <em>paper</em>.</li>
          <li>Ask what I remember from 2002.</li>
        </ul>
        <button class="ghost" id="tourBtn">Give me the tour</button>`;
    }
  };

  function openPanel(id) {
    const html = panels[id];
    if (!html) return;
    panelBody.innerHTML = html();
    panel.hidden = false;
    bindPanel(id);
  }

  function bindPanel(id) {
    if (id === "radio") {
      $$(".station", panel).forEach((btn) => {
        btn.onclick = () => {
          const st = btn.getAttribute("data-st");
          if (st === "off") { Radio.stop(); say(t().radioOff); chat(t().radioOffChat); }
          else Radio.play(st);
          openPanel("radio");
        };
      });
    }
    if (id === "phone") {
      $("#leaveMsg")?.addEventListener("click", () => {
        const v = $("#phoneNote").value.trim();
        if (lang === "ar") {
          $("#phoneAck").textContent = v ? `مابري كتب: «${v} اتصل.»` : "مابري مسك السماعة. السكة ساكتة.";
          chat(v ? `حد سيب رسالة: ${v}` : "التليفون رن. محدش تكلم.");
        } else {
          $("#phoneAck").textContent = v ? `Mabry wrote it down: “${v} called.”` : "Mabry held the phone. Silence on the line.";
          chat(v ? `Someone left a message: ${v}` : "The phone rang. Nobody spoke.");
        }
      });
    }
    if (id === "notebook") {
      $("#saveProj")?.addEventListener("click", () => {
        const title = $("#projTitle").value.trim();
        const d = $("#projBody").value.trim();
        if (!title) return;
        const notes = JSON.parse(localStorage.getItem("syte_projects") || "[]");
        notes.unshift({ t: title, d: d || "—" });
        localStorage.setItem("syte_projects", JSON.stringify(notes.slice(0, 12)));
        chat(lang === "ar" ? `ثبّت «${title}» في الكراسة.` : `Pinned “${title}” in the notebook.`);
        openPanel("notebook");
      });
    }
    if (id === "bin") {
      $("#throwAway")?.addEventListener("click", () => {
        const v = $("#trashLine").value.trim();
        if (!v) return;
        const trash = JSON.parse(localStorage.getItem("syte_bin") || "[]");
        trash.unshift(v);
        localStorage.setItem("syte_bin", JSON.stringify(trash.slice(0, 20)));
        chat(lang === "ar" ? "اترمى في الزبالة اللي ودنها زي الدب." : "Into the bear can it goes.");
        openPanel("bin");
      });
    }
    if (id === "paper") {
      $("#saveSheet")?.addEventListener("click", () => {
        localStorage.setItem("syte_paper", $("#sheet").value);
        say(lang === "ar" ? "الورقة لسه على المكتب." : "The sheet is still on the desk.");
        chat(lang === "ar" ? "حطيت النظارة على الركن عشان متطيرش." : "I put a glass on the corner so it wouldn't blow away.");
      });
      $("#readSheet")?.addEventListener("click", () => {
        const sheet = $("#sheet").value.trim();
        const msg = sheet
          ? (lang === "ar" ? `بقرا ورقتك: ${sheet.slice(0, 280)}` : `Reading your sheet: ${sheet.slice(0, 280)}`)
          : (lang === "ar" ? "الورقة فاضية. وده تمام." : "The page is blank. That's allowed.");
        chat(msg);
        if (sheet) speakText(sheet);
      });
    }
    if (id === "mabry") {
      $("#tourBtn")?.addEventListener("click", startTour);
    }
  }

  $("#closePanel").addEventListener("click", () => {
    panel.hidden = true;
    say(t().back);
  });

  $$(".obj").forEach((btn) => {
    btn.addEventListener("mouseenter", () => say(lineOf(btn)));
    btn.addEventListener("focus", () => say(lineOf(btn)));
    btn.addEventListener("click", () => {
      const id = btn.dataset.panel;
      const spoken = lineOf(btn);
      openPanel(id);
      chat(spoken);
      if (lang === "ar" && btn.dataset.voiceAr) playClip(btn.dataset.voiceAr);
      else speakText(spoken);
    });
  });

  function reply(text) {
    const q = text.toLowerCase();
    const ar = lang === "ar";
    if (/radio|music|song|راديو|اغني|أغني|موسيقى|مزيكا/.test(q)) {
      openPanel("radio"); playClip(ar ? "assets/ar_radio.mp3" : null);
      return ar ? "ده الراديو. أقدر أسيب جاز المكتب وأنت بترسم." : "That's the radio. I can leave Desk Jazz on while you draw.";
    }
    if (/phone|contact|call|handset|تليفون|تلفون|سماعة|معارف|اتصال/.test(q)) {
      openPanel("phone"); playClip(ar ? "assets/ar_phone.mp3" : null);
      return ar ? "السماعة. المعارف هناك. سيب اسم لو حابب." : "Handset. Contacts live there. Leave a name if you like.";
    }
    if (/glass|vision|see|نظارة|رؤية|بص/.test(q)) {
      openPanel("vision"); playClip(ar ? "assets/ar_vision.mp3" : null);
      return ar ? "النظارة. دي كانت الفكرة كلها — تشوف الموقع كأوضة." : "The glasses. That was the whole point — see the site as a room.";
    }
    if (/note|blog|project|كراسة|مدونة|مشروع/.test(q)) {
      openPanel("notebook"); playClip(ar ? "assets/ar_notebook.mp3" : null);
      return ar ? "الكراسة. المشاريع والمدونة اللي كانت جاية." : "Notebook. Projects and the blog that was going to happen.";
    }
    if (/frame|about|memor|برواز|ذكر|عنه/.test(q)) {
      openPanel("memories"); playClip(ar ? "assets/ar_memories.mp3" : null);
      return ar ? "البرواز. صفحة عنه وصفحة الذكريات، نفس الحكاية." : "The frame. About page, memory page, same thing.";
    }
    if (/count|visitor|عداد|زوار/.test(q)) {
      openPanel("counter"); playClip(ar ? "assets/ar_counter.mp3" : null);
      return ar
        ? `العدّاد. ${YEARS} سنة على الرف. دي الزيارة رقم ${visits} في المتصفح ده.`
        : `The ticker. ${YEARS} years on the shelf. You are visit ${visits} in this browser.`;
    }
    if (/bin|trash|garbage|bear|junk|زبالة|دب|رمي/.test(q)) {
      openPanel("bin"); playClip(ar ? "assets/ar_bin.mp3" : null);
      return ar
        ? "العلبة اللي ودنها زي الدب. حتى اللي رسمها نسي كانت ليه. بقت للجمل اللي بتترمي."
        : "The bear can. Even the person who drew it forgot what it was for. So now it's for discarded lines.";
    }
    if (/paper|write|sheet|ورقة|اكتب|كتابة/.test(q)) {
      openPanel("paper"); playClip(ar ? "assets/ar_paper.mp3" : null);
      return ar ? "ورقة فاضية تحت النظارة. اكتب؛ أنا هخليها." : "Blank sheet under the glasses. Write; I'll keep it.";
    }
    if (/tour|show me|walk|جولة|وريني|ورّيني/.test(q)) {
      startTour();
      return ar ? "اقعد على المكتب. هشير على الحاجات." : "Stay on the desk. I'll point at things.";
    }
    if (/2026|future|modern|os skin|مستقبل| حداثة|حديت/.test(q)) {
      setEra("2026", false);
      return t().flip26;
    }
    if (/\b2002\b|classic|scanline|vintage|كلاسيك|القديم/.test(q)) {
      setEra("2002", false);
      return t().flip02;
    }
    if (/hello|hi|hey|yo|سلام|اهلا|أهلا|ازيك|إزيك/.test(q)) {
      return ar
        ? "أهلاً. أنا مابري. قاعد على الكراسة من ٢٠٠٢. عايز تفتح إيه؟"
        : "Hey. I'm Mabry. I have been sitting on this pad since 2002. What do you want to open?";
    }
    if (/2002|old|year|wait|سنين|قديم|استنى/.test(q)) {
      return ar
        ? `${YEARS} سنة. الرسوم ما اتغيرتش. النت اتغيّر. خلينا على الرسوم.`
        : `${YEARS} years. The drawings didn't change. The web did. We kept the drawings.`;
    }
    if (/help|what can|ساعد|تقدر/.test(q)) {
      return ar
        ? "حوم على أي حاجة. دوس. أو قول راديو، تليفون، نظارة، كراسة، برواز، عداد، زبالة، ورقة."
        : "Hover anything. Click it. Or tell me radio, phone, glasses, notebook, frame, counter, bin, paper.";
    }
    if (/quiet|shut|bye|اسكت|باي|سلام عليكم/.test(q)) {
      return ar
        ? "هبقى القلم اللي في الركن. دوس عليا لما تحب الأوضة تتشرح تاني."
        : "I'll be the pencil in the corner. Click me when you want the room explained again.";
    }
    return ar
      ? "أنا أعرف المكتب ده بس. سمّي حاجة — راديو، تليفون، نظارة، كراسة، برواز، عداد، زبالة، ورقة — وأفتحها."
      : "I only really know this desk. Name an object — radio, phone, glasses, notebook, frame, counter, bin, paper — and I'll open it.";
  }

  $("#chatform").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#chatinput");
    const text = input.value.trim();
    if (!text) return;
    chat(text, "u");
    input.value = "";
    setTimeout(() => {
      const r = reply(text);
      chat(r);
      if (lang === "ar") speakText(r);
    }, 280);
  });

  $("#playVoice").addEventListener("click", () => {
    stopVoices();
    const a = lang === "ar" ? voiceAr : voiceEn;
    a.currentTime = 0;
    a.play().catch(() => chat(t().blocked));
    chat(t().heard);
  });

  const tour = [
    ["trash", "bin"],
    ["frame", "memories"],
    ["counter", "counter"],
    ["radio", "radio"],
    ["phone", "phone"],
    ["notebook", "notebook"],
    ["paper", "paper"],
    ["glasses", "vision"],
    ["mabry", "mabry"]
  ];
  let tourTimer;
  function startTour() {
    clearTimeout(tourTimer);
    let i = 0;
    playClip(lang === "ar" ? "assets/ar_tour.mp3" : null);
    const step = () => {
      $$(".obj").forEach((o) => o.classList.remove("touring"));
      if (i >= tour.length) {
        say(t().tourEnd);
        chat(t().tourEndChat);
        return;
      }
      const [cls, panelId] = tour[i];
      const el = $("." + cls);
      el?.classList.add("touring");
      say(lineOf(el));
      if (lang === "ar" && el?.dataset.voiceAr) playClip(el.dataset.voiceAr);
      openPanel(panelId);
      i += 1;
      tourTimer = setTimeout(step, 3800);
    };
    chat(t().tourChat);
    step();
  }

  $("#langEn").addEventListener("click", () => { lang = "en"; applyLang(); stopVoices(); });
  $("#langAr").addEventListener("click", () => { lang = "ar"; applyLang(); stopVoices(); });
  $("#era2002").addEventListener("click", () => setEra("2002", true));
  $("#era2026").addEventListener("click", () => setEra("2026", true));

  function tickClock() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    $("#clock").textContent = hh + ":" + mm;
  }
  tickClock();
  setInterval(tickClock, 15000);

  applyLang();
  applyEraChrome();
  chat(t().open);
})();
