// Loop infinito real del video de fondo sin cambiar de dirección: dos copias
// del mismo clip, desfasadas exactamente medio ciclo. Cada capa se desvanece
// justo antes de que su propio <video> reinicie (loop nativo) y la otra capa,
// a medio recorrido, está a plena opacidad — así el reinicio nunca es
// visible y los números siempre parecen venir hacia adelante, nunca hacia
// atrás.
(function () {
    "use strict";

    var a = document.getElementById("bg-video-a");
    var b = document.getElementById("bg-video-b");
    if (!a || !b) return;

    function envelope(p) {
        if (p < 0.15) return p / 0.15;
        if (p > 0.85) return (1 - p) / 0.15;
        return 1;
    }

    function start() {
        a.currentTime = 0;
        a.play().catch(function () {});
        b.play().catch(function () {});

        var offsetDone = false;
        var offsetTimer = window.setInterval(function () {
            if (offsetDone) {
                window.clearInterval(offsetTimer);
                return;
            }
            if (b.duration && !isNaN(b.duration) && b.duration > 0) {
                b.currentTime = b.duration / 2;
                offsetDone = true;
                window.clearInterval(offsetTimer);
            }
        }, 30);

        function frame() {
            [a, b].forEach(function (v) {
                if (v.duration && !isNaN(v.duration) && v.duration > 0) {
                    var p = v.currentTime / v.duration;
                    v.style.opacity = envelope(p).toFixed(3);
                }
                // El navegador pausa video en pestañas en segundo plano; al
                // volver, retoma la reproducción para no dejar el fondo congelado.
                if (v.paused && !document.hidden) {
                    v.play().catch(function () {});
                }
            });
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                a.play().catch(function () {});
                b.play().catch(function () {});
            }
        });
    }

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start);
})();
