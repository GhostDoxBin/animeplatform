// Player page functionality
class PlayerPage {
    constructor() {
        this.videoContainer = document.getElementById('video-page-player');
        this.videoPlaceholder = document.getElementById('video-placeholder');
        this.episodeSelect = document.getElementById('episode-select');
        this.playBtn = document.getElementById('play-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.episodesGrid = document.getElementById('episodes-grid');
        
        this.currentAnime = null;
        this.currentEpisode = 1;
        this.currentVideo = null;
        
        this.init();
    }

    init() {
        console.log('Initializing player page');
        this.loadAnime();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.playVideo());
        }
        
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        if (this.episodeSelect) {
            this.episodeSelect.addEventListener('change', (e) => {
                this.currentEpisode = parseInt(e.target.value);
                this.playVideo();
            });
        }
    }

    loadAnime() {
        // Get anime ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const animeId = urlParams.get('anime');
        
        let anime;
        
        if (animeId) {
            // Load by ID from URL
            anime = window.animeData.getAnimeById(parseInt(animeId));
        } else {
            // Load from storage
            const storedAnime = localStorage.getItem('currentAnime');
            anime = storedAnime ? JSON.parse(storedAnime) : null;
        }
        
        if (anime) {
            this.currentAnime = anime;
            this.updatePlayerInfo(anime);
            this.loadEpisodes();
            this.hidePlaceholder();
        } else {
            this.showPlaceholder();
        }
    }

    updatePlayerInfo(anime) {
        if (!anime) return;

        console.log('Updating player page info for:', anime.title);
        
        const elements = {
            mainTitle: document.getElementById('player-main-title'),
            title: document.getElementById('player-title'),
            description: document.getElementById('player-description'),
            rating: document.getElementById('player-rating'),
            year: document.getElementById('player-year'),
            episodes: document.getElementById('player-episodes'),
            genre: document.getElementById('player-genre'),
            status: document.getElementById('player-status'),
            studio: document.getElementById('player-studio')
        };

        // Update all elements
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                switch(key) {
                    case 'mainTitle':
                    case 'title':
                        elements[key].textContent = anime.title;
                        break;
                    case 'description':
                        elements[key].textContent = anime.description;
                        break;
                    case 'rating':
                        elements[key].textContent = anime.rating;
                        break;
                    case 'year':
                        elements[key].textContent = anime.year;
                        break;
                    case 'episodes':
                        elements[key].textContent = `${anime.episodes} эп.`;
                        break;
                    case 'genre':
                        elements[key].textContent = anime.genre;
                        break;
                    case 'status':
                        elements[key].textContent = anime.status;
                        break;
                    case 'studio':
                        elements[key].textContent = anime.studio;
                        break;
                }
            }
        });
    }

    hidePlaceholder() {
        if (this.videoPlaceholder) {
            this.videoPlaceholder.style.display = 'none';
        }
    }

    showPlaceholder() {
        if (this.videoPlaceholder) {
            this.videoPlaceholder.style.display = 'flex';
        }
    }

    loadEpisodes() {
        if (!this.currentAnime) return;

        // Clear existing options
        if (this.episodeSelect) {
            this.episodeSelect.innerHTML = '<option value="">Выберите эпизод</option>';
        }
        
        if (this.episodesGrid) {
            this.episodesGrid.innerHTML = '';
        }

        const episodesToShow = this.currentAnime.episodesList.slice(0, 20);

        episodesToShow.forEach(episode => {
            // Add to dropdown
            if (this.episodeSelect) {
                const option = document.createElement('option');
                option.value = episode.number;
                option.textContent = `Эпизод ${episode.number}`;
                this.episodeSelect.appendChild(option);
            }

            // Add to episodes grid
            if (this.episodesGrid) {
                const episodeCard = document.createElement('div');
                episodeCard.className = 'episode-card';
                episodeCard.innerHTML = `
                    <div class="episode-number">Эпизод ${episode.number}</div>
                    <div class="episode-title">${episode.title}</div>
                    <div class="episode-duration">${episode.duration}</div>
                `;

                episodeCard.addEventListener('click', () => {
                    this.selectEpisode(episode.number);
                });

                this.episodesGrid.appendChild(episodeCard);
            }
        });

        // Select first episode by default
        if (episodesToShow.length > 0) {
            this.selectEpisode(1);
        }
    }

    selectEpisode(episodeNumber) {
        this.currentEpisode = episodeNumber;
        
        if (this.episodeSelect) {
            this.episodeSelect.value = episodeNumber;
        }
        
        // Update active episode in grid
        if (this.episodesGrid) {
            document.querySelectorAll('.episode-card').forEach(card => {
                card.classList.remove('active');
            });
            
            const selectedCard = document.querySelector(`.episode-card:nth-child(${episodeNumber})`);
            if (selectedCard) {
                selectedCard.classList.add('active');
            }
        }
    }

    playVideo() {
        if (!this.currentAnime) {
            alert('Пожалуйста, выберите аниме для воспроизведения');
            return;
        }

        if (!this.currentEpisode) {
            alert('Пожалуйста, выберите эпизод для воспроизведения');
            return;
        }

        // Clear video container
        if (this.videoContainer) {
            // Remove placeholder if still visible
            if (this.videoPlaceholder && this.videoPlaceholder.style.display !== 'none') {
                this.videoPlaceholder.style.display = 'none';
            }
            
            // Remove existing video
            const existingIframe = this.videoContainer.querySelector('iframe');
            if (existingIframe) {
                existingIframe.remove();
            }
            
            // Create video iframe
            const iframe = document.createElement('iframe');
            iframe.src = this.currentAnime.videoUrl + '?autoplay=1';
            iframe.allow = 'autoplay; encrypted-media';
            iframe.allowFullscreen = true;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '10px';
            
            this.videoContainer.appendChild(iframe);
            this.currentVideo = iframe;
        }

        // Update title
        const titleElement = document.getElementById('player-title');
        if (titleElement) {
            titleElement.textContent = `${this.currentAnime.title} - Эпизод ${this.currentEpisode}`;
        }
    }

    toggleFullscreen() {
        if (!this.currentVideo) return;

        if (!document.fullscreenElement) {
            if (this.currentVideo.requestFullscreen) {
                this.currentVideo.requestFullscreen();
            } else if (this.currentVideo.webkitRequestFullscreen) {
                this.currentVideo.webkitRequestFullscreen();
            } else if (this.currentVideo.msRequestFullscreen) {
                this.currentVideo.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
}

// Initialize player page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('video-page-player')) {
        window.playerPage = new PlayerPage();
        console.log('Player page initialized');
    }
});