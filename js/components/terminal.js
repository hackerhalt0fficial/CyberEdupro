document.addEventListener('DOMContentLoaded', function() {
    const terminal = document.getElementById('typewriter');
    if (!terminal) return;

    const messages = [
        'Welcome to CyberEdu Pro...',
        'Initializing training environment...',
        'Loading cybersecurity modules...',
        'Configuring virtual labs...',
        'Training environment ready!',
        '> Type "start" to begin your journey'
    ];

    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const currentMessage = messages[messageIndex];
        
        if (isDeleting) {
            // Deleting text
            terminal.innerHTML = `<span class="prompt">$</span> ${currentMessage.substring(0, charIndex)}`;
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                messageIndex++;
                if (messageIndex === messages.length) messageIndex = 0;
                setTimeout(type, 500);
                return;
            }
        } else {
            // Typing text
            terminal.innerHTML = `<span class="prompt">$</span> ${currentMessage.substring(0, charIndex)}<span class="cursor">|</span>`;
            charIndex++;

            if (charIndex > currentMessage.length) {
                isPaused = true;
                setTimeout(() => {
                    isPaused = false;
                    isDeleting = true;
                    type();
                }, 2000);
                return;
            }
        }

        const speed = isDeleting ? 30 : Math.random() * 100 + 50;
        setTimeout(type, speed);
    }

    type();
});