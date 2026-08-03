// Pantalla de entrada: exige un click en "I'M READY" antes de revelar el
// contenido, dispara un aviso por click via ntfy.sh (sin cuentas, sin backend
// propio) y dispara el efecto "cámara volando hacia adentro de la pantalla":
// el fondo y el texto del gate se disparan hacia el espectador en un solo
// movimiento acelerado; en el instante exacto en que ese vuelo termina, un
// flash de pantalla completa muy corto oculta el reseteo (vuelve todo a su
// escala normal) mientras revela el contenido principal — todo sincronizado
// al mismo reloj, sin animaciones sueltas pisándose.
(function () {
    "use strict";

    var NTFY_TOPIC = "andrewtrades-emoney-dee855e3";
    var WARP_MS = 620;
    var FLASH_MS = 320;

    var gate = document.getElementById("gate");
    var btn = document.getElementById("gate-btn");
    var main = document.getElementById("main-content");
    var flash = document.getElementById("warp-flash");
    var question = document.querySelector(".gate-question");
    var overlay = document.querySelector(".overlay");
    var bgLayers = [document.getElementById("bg-video-a"), document.getElementById("bg-video-b")].filter(Boolean);
    if (!gate || !btn || !main || !flash || !question) return;

    document.documentElement.style.setProperty("--warp-ms", WARP_MS + "ms");

    function notifyClick() {
        var now = new Date();
        var body =
            "Hora: " + now.toLocaleString("es-CO", { timeZone: "America/Bogota" }) + "\n" +
            "Idioma: " + (navigator.language || "?") + "\n" +
            "Pantalla: " + window.screen.width + "x" + window.screen.height + "\n" +
            "Referrer: " + (document.referrer || "directo");

        fetch("https://ntfy.sh/" + NTFY_TOPIC, {
            method: "POST",
            body: body,
            headers: {
                "Title": "Nuevo click en I'M READY",
                "Tags": "zap",
            },
            keepalive: true,
        }).catch(function () {
            // Silencioso: el tracking nunca debe romper la experiencia del visitante.
        });
    }

    function restartLinkCardAnimations() {
        var cards = main.querySelectorAll(".link-card");
        cards.forEach(function (card) {
            card.style.animation = "none";
            void card.offsetWidth;
            card.style.animation = "";
        });
    }

    function reveal() {
        // Fase 1 (0 → WARP_MS): la cámara "vuela" — fondo y texto del gate
        // aceleran hacia el espectador al mismo tiempo, con la misma curva.
        btn.classList.add("is-clicked");
        gate.classList.add("is-leaving");
        question.classList.add("is-warping");
        btn.classList.add("is-warping");
        bgLayers.forEach(function (v) { v.classList.add("is-warping"); });
        if (overlay) overlay.classList.add("is-warping");
        notifyClick();

        // Fase 2 (en WARP_MS exacto): el flash de pantalla completa tapa el
        // instante del reseteo — todo vuelve a su escala normal en el mismo
        // tick en que el flash está en su punto más brillante.
        window.setTimeout(function () {
            flash.classList.add("is-flashing");

            bgLayers.forEach(function (v) { v.classList.remove("is-warping"); });
            if (overlay) overlay.classList.remove("is-warping");
            gate.setAttribute("hidden", "");
            restartLinkCardAnimations();
            main.classList.add("is-revealed");
        }, WARP_MS);

        // Fase 3: limpieza del flash una vez terminó de desvanecerse.
        window.setTimeout(function () {
            flash.classList.remove("is-flashing");
            question.classList.remove("is-warping");
            btn.classList.remove("is-warping");
        }, WARP_MS + FLASH_MS);
    }

    btn.addEventListener("click", function () {
        if (btn.classList.contains("is-clicked")) return;
        reveal();
    });
})();
