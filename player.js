// Player functionality for overlay
class AnimePlayer {
    constructor() {
        this.overlay = document.getElementById('player-overlay');
        this.closeBtn = document.getElementById('close-player');
        this.title = document.getElementById('player-title');
        this.frame = document.getElementById('player-frame');
        
        this.init();
    }

    init() {
        console.log('Initializing overlay player');
        
        // Close player events
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.close();
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('active')) {
                this.close();
            }
        });
        
        console.log('Overlay player initialized successfully');
    }

    open(anime) {
        console.log('Opening player overlay for:', anime.title);
        
        if (this.overlay && this.title && this.frame) {
            // Open in overlay on same page
            this.title.textContent = `Сейчас воспроизводится: ${anime.title}`;
            this.frame.src = anime.videoUrl + '?autoplay=1';
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('Player overlay opened successfully');
        } else {
            console.log('Redirecting to player page');
            // Redirect to player page
            localStorage.setItem('currentAnime', JSON.stringify(anime));
            window.location.href = `player.html?anime=${anime.id}`;
        }
    }

    close() {
        if (this.overlay && this.frame) {
            this.overlay.classList.remove('active');
            this.frame.src = '';
            document.body.style.overflow = '';
            console.log('Player overlay closed');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animePlayer = new AnimePlayer();
    console.log('Global animePlayer created for overlay');
});