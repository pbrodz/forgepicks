/* Ask the Forge — IRONHOLD Q&A widget. Builds its own DOM + CSS. */
(function () {
  var API = "https://ask-forge.pbrodz-399.workers.dev";
  var css = [
    "#faf-btn{position:fixed;right:1.1rem;bottom:1.1rem;z-index:60;background:#232329;color:#f2ede4;",
    "border:1px solid #d08a4e;border-radius:999px;padding:.65rem 1.15rem;font:600 .9rem/1 system-ui,sans-serif;",
    "cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.45)}",
    "#faf-btn:hover{background:#2c2c34}",
    "#faf-panel{position:fixed;right:1.1rem;bottom:4.3rem;z-index:60;width:min(370px,calc(100vw - 2.2rem));",
    "max-height:min(520px,calc(100vh - 6rem));display:flex;flex-direction:column;background:#1c1c21;color:#e8e8ec;",
    "border:1px solid #3a3a44;border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.55)}",
    "#faf-panel[hidden]{display:none}",
    ".faf-head{padding:.8rem 1rem;border-bottom:1px solid #3a3a44;background:#232329}",
    ".faf-head strong{color:#d08a4e;font-size:.95rem;letter-spacing:.3px}",
    ".faf-head span{display:block;font-size:.75rem;color:#9a9aa5;margin-top:.15rem}",
    ".faf-head button{position:absolute;top:.5rem;right:.7rem;background:none;border:0;color:#9a9aa5;",
    "font-size:1.3rem;cursor:pointer;line-height:1}",
    "#faf-msgs{flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:.6rem;min-height:120px}",
    ".faf-m{max-width:88%;padding:.55rem .8rem;border-radius:12px;font-size:.88rem;line-height:1.45}",
    ".faf-m.u{align-self:flex-end;background:#d08a4e;color:#1c1c21;border-bottom-right-radius:3px}",
    ".faf-m.a{align-self:flex-start;background:#2c2c34;border-bottom-left-radius:3px}",
    ".faf-m.a.typing{color:#9a9aa5}",
    "#faf-form{display:flex;gap:.5rem;padding:.7rem;border-top:1px solid #3a3a44}",
    "#faf-input{flex:1;background:#2c2c34;border:1px solid #3a3a44;border-radius:8px;color:#e8e8ec;",
    "padding:.55rem .7rem;font-size:.88rem;outline:none}",
    "#faf-input:focus{border-color:#d08a4e}",
    "#faf-form button{background:#d08a4e;border:0;border-radius:8px;color:#1c1c21;font-weight:700;",
    "padding:.55rem .95rem;font-size:.88rem;cursor:pointer}",
    "#faf-form button:disabled{opacity:.5;cursor:default}"
  ].join("\n");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function addMsg(who, text, typing) {
    var m = el("div", "faf-m " + who + (typing ? " typing" : ""), text);
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
    return m;
  }

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var btn = el("button", null, "Ask the Forge");
  btn.id = "faf-btn";
  btn.setAttribute("aria-label", "Ask the Forge a question about mini PCs");

  var panel = el("div");
  panel.id = "faf-panel";
  panel.hidden = true;
  var head = el("div", "faf-head");
  head.style.position = "relative";
  head.appendChild(el("strong", null, "Ask the Forge"));
  head.appendChild(el("span", null, "Mini-PC questions, answered from our picks"));
  var close = el("button", null, "\u00d7");
  close.setAttribute("aria-label", "Close");
  head.appendChild(close);
  var msgs = el("div");
  msgs.id = "faf-msgs";
  var form = el("form");
  form.id = "faf-form";
  var input = el("input");
  input.id = "faf-input";
  input.type = "text";
  input.maxLength = 500;
  input.autocomplete = "off";
  input.placeholder = "e.g. cheapest box for Home Assistant?";
  input.setAttribute("aria-label", "Your question");
  var send = el("button", null, "Send");
  send.type = "submit";
  form.appendChild(input);
  form.appendChild(send);
  panel.appendChild(head);
  panel.appendChild(msgs);
  panel.appendChild(form);
  document.body.appendChild(btn);
  document.body.appendChild(panel);

  var greeted = false, busy = false;
  function toggle(force) {
    panel.hidden = typeof force === "boolean" ? !force : !panel.hidden;
    if (!panel.hidden && !greeted) {
      greeted = true;
      addMsg("a", "Welcome to the forge. Ask me anything about our 8 mini-PC picks — best for Plex, cheapest for Home Assistant, lowest power draw, whatever you need.");
    }
    if (!panel.hidden) input.focus();
  }
  btn.addEventListener("click", function () { toggle(); });
  close.addEventListener("click", function () { toggle(false); });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var q = input.value.trim();
    if (!q || busy) return;
    busy = true;
    send.disabled = true;
    addMsg("u", q);
    input.value = "";
    var t = addMsg("a", "\u2026", true);
    fetch(API + "/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (res) {
        t.classList.remove("typing");
        if (res.j && res.j.answer) t.textContent = res.j.answer;
        else if (res.j && res.j.error) t.textContent = res.j.error;
        else t.textContent = "The forge is quiet right now \u2014 try again in a bit.";
      })
      .catch(function () {
        t.classList.remove("typing");
        t.textContent = "Couldn't reach the forge \u2014 check your connection and try again.";
      })
      .then(function () {
        busy = false;
        send.disabled = false;
        msgs.scrollTop = msgs.scrollHeight;
        input.focus();
      });
  });
})();
