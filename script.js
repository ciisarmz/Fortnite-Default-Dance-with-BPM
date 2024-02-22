document.addEventListener('DOMContentLoaded', function() {
    var video = document.getElementById('dance-video');
    video.pause(); // Detenemos el video al cargar la página
    video.currentTime = 0; // Reiniciamos el tiempo de reproducción
    video.removeAttribute('controls'); // Eliminar los controles del reproductor de video

    // Ajustar el tamaño del video al 2/3 de su tamaño original
    video.style.width = 'calc(100% * 2 / 3)';

    var bpmInfo = document.getElementById('bpm-info');
    var keyPressTimes = [];
    var bpmInterval;
    var bpmTimeout;
    var adjustBPM = false; // Bandera para indicar si se debe realizar el ajuste del BPM
    var totalKeyPresses = 0; // Contador para el número total de pulsaciones de teclas

    function detectBPM() {
        var sum = 0;
        var weightsSum = 0; // Suma de los pesos para el promedio ponderado
        for (var i = 1; i < keyPressTimes.length; i++) {
            var interval = keyPressTimes[i] - keyPressTimes[i - 1];
            // Ajustar el peso según sea necesario
            var weight = i; // Puedes probar con otros valores
            sum += interval * weight;
            weightsSum += weight;
        }
        var weightedAverage = sum / weightsSum;
        var bpm = Math.round(60000 / weightedAverage); // Redondear a entero

        // Ajustar el BPM si se activó la bandera y el BPM está a una unidad de distancia de un número que termine en 0 o 5
        if (adjustBPM) {
            var lastDigit = bpm % 10;
            if (lastDigit === 1 || lastDigit === 9) {
                bpm -= 1;
            } else if (lastDigit === 4 || lastDigit === 6) {
                bpm += 1;
            }
        }

        bpmInfo.textContent = "BPM detectado: " + bpm;
        video.playbackRate = bpm / 100;
        video.play();
    }

    // Evento de escucha para la tecla de espacio
    function handleKeyPress(event) {
        if (event.code === 'Space') {
            startBPMDetection();
            // Agregar animación de palpitación al texto
            bpmInfo.classList.add('pulse-animation');
            setTimeout(function() {
                // Eliminar la clase de animación después de un breve período para que pueda volver a aplicarse en la siguiente pulsación
                bpmInfo.classList.remove('pulse-animation');
            }, 300); // Cambié el tiempo de la animación a 0.3 segundos
        } else if (event.code === 'Enter') {
            video.pause(); // Detener el video cuando se presiona Enter
        }
    }

    function startBPMDetection() {
        video.currentTime = 0; // Reiniciar el video
        var currentTime = performance.now(); // Utilizar performance.now() para obtener una marca de tiempo de alta resolución
        if (keyPressTimes.length > 0) {
            var lastInterval = currentTime - keyPressTimes[keyPressTimes.length - 1];
            // Ajustar los límites del filtrado de valores extremos (límite inferior: 50 ms, límite superior: 3000 ms)
            if (lastInterval < 3000 && lastInterval > 50) {
                keyPressTimes.push(currentTime);
            }
        } else {
            keyPressTimes.push(currentTime);
        }

        totalKeyPresses++; // Incrementar el contador de pulsaciones de teclas

        // Activar el ajuste del BPM solo durante las primeras 8 pulsaciones
        if (totalKeyPresses <= 8) {
            adjustBPM = true;
        } else {
            adjustBPM = false;
        }

        if (keyPressTimes.length === 1) {
            bpmInfo.textContent = "Detectando BPM..."; // Mostrar "Detectando BPM..." al iniciar el algoritmo
        }
        if (keyPressTimes.length >= 4) {
            clearInterval(bpmInterval); // Limpiar intervalo anterior si existe
            detectBPM(); // Calcular BPM después de las 4 pulsaciones
            bpmInterval = setInterval(detectBPM, 500); // Actualizar BPM cada 0.5 segundos
        }
        clearTimeout(bpmTimeout);
        bpmTimeout = setTimeout(function() {
            clearInterval(bpmInterval);
            bpmInterval = null;
            keyPressTimes = [];
            bpmInfo.textContent = "Presiona la tecla espacio al ritmo del BPM que quieras";
            adjustBPM = false; // Desactivar el ajuste del BPM
            totalKeyPresses = 0; // Reiniciar el contador de pulsaciones de teclas
        }, 2000); // Detener la detección de BPM después de 2 segundos de inactividad
    }

    document.addEventListener('keydown', handleKeyPress);

    document.getElementById('stop-button').addEventListener('click', function() {
        video.pause();
    });
});
