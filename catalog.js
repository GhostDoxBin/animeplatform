// Catalog page functionality
class Catalog {
    constructor() {
        this.grid = document.getElementById('catalog-grid');
        this.searchInput = document.getElementById('catalog-search');
        this.searchBtn = document.getElementById('catalog-search-btn');
        this.genreFilter = document.getElementById('genre-filter');
        this.yearFilter = document.getElementById('year-filter');
        this.ratingFilter = document.getElementById('rating-filter');
        this.sortFilter = document.getElementById('sort-filter');
        this.loadMoreBtn = document.getElementById('load-more');
        
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentResults = [];
        
        this.init();
    }

    init() {
        console.log('Initializing catalog');
        this.loadAnime();
        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log('Setting up catalog event listeners');
        
        // Search
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Filters
        if (this.genreFilter) {
            this.genreFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (this.yearFilter) {
            this.yearFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (this.ratingFilter) {
            this.ratingFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (this.sortFilter) {
            this.sortFilter.addEventListener('change', () => this.applyFilters());
        }

        // Load more
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
        
        // Делегирование событий для карточек
        if (this.grid) {
            this.grid.addEventListener('click', (e) => {
                // Обработка кнопки "Смотреть сейчас"
                if (e.target.classList.contains('btn-watch') || e.target.closest('.btn-watch')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const button = e.target.classList.contains('btn-watch') ? e.target : e.target.closest('.btn-watch');
                    const card = button.closest('.anime-card');
                    const animeId = card ? card.getAttribute('data-anime-id') : null;
                    
                    console.log('Catalog watch button clicked for anime ID:', animeId);
                    
                    if (animeId && window.animeData) {
                        const anime = window.animeData.getAnimeById(parseInt(animeId));
                        if (anime) {
                            console.log('Opening anime from catalog:', anime.title);
                            if (typeof openPlayer === 'function') {
                                openPlayer(anime);
                            } else {
                                localStorage.setItem('currentAnime', JSON.stringify(anime));
                                window.location.href = `player.html?anime=${anime.id}`;
                            }
                        }
                    }
                }
                
                // Обработка клика по карточке
                if (e.target.closest('.anime-card') && !e.target.classList.contains('btn-watch')) {
                    const card = e.target.closest('.anime-card');
                    const animeId = card.getAttribute('data-anime-id');
                    
                    if (animeId && window.animeData) {
                        const anime = window.animeData.getAnimeById(parseInt(animeId));
                        if (anime && window.animeModal) {
                            console.log('Catalog card clicked, opening modal for:', anime.title);
                            window.animeModal.open(anime);
                        }
                    }
                }
            });
        }
    }

    performSearch() {
        this.currentPage = 1;
        this.applyFilters();
    }

    applyFilters() {
        const searchTerm = this.searchInput ? this.searchInput.value.trim() : '';
        const filters = {
            genre: this.genreFilter ? this.genreFilter.value : '',
            year: this.yearFilter ? this.yearFilter.value : '',
            rating: this.ratingFilter ? this.ratingFilter.value : '',
            sort: this.sortFilter ? this.sortFilter.value : 'rating'
        };

        this.currentResults = window.animeData.searchAnime(searchTerm, filters);
        this.currentPage = 1;
        this.renderAnime();
    }

    loadAnime() {
        this.currentResults = [...window.animeData.animeList];
        this.renderAnime();
    }

    renderAnime() {
        if (!this.grid) return;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const animeToShow = this.currentResults.slice(0, endIndex);

        this.grid.innerHTML = '';

        if (animeToShow.length === 0) {
            this.showNoResults();
            return;
        }

        animeToShow.forEach(anime => {
            const card = this.createAnimeCard(anime);
            this.grid.appendChild(card);
        });

        // Show/hide load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = 
                endIndex < this.currentResults.length ? 'block' : 'none';
        }
    }

    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.setAttribute('data-anime-id', anime.id);
        card.innerHTML = `
            <div class="anime-image">
                <img src="${anime.poster}" alt="${anime.title}" 
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\"display: flex; align-items: center; justify-content: center; height: 100%; color: #8a99b3;\">Нет изображения</div>'">
            </div>
            <div class="anime-info">
                <h3 class="anime-title">${anime.title}</h3>
                <div class="anime-rating">
                    <div class="rating-stars">${this.generateStars(anime.rating)}</div>
                    <div class="rating-value">${anime.rating}/10</div>
                </div>
                <p class="anime-description">${anime.description.substring(0, 100)}...</p>
                <button class="btn btn-watch" data-anime-id="${anime.id}">Смотреть сейчас</button>
            </div>
        `;

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }

    showNoResults() {
        this.grid.innerHTML = `
            <div class="no-results">
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска или фильтры</p>
                <button class="btn btn-primary" onclick="catalog.resetFilters()">Сбросить фильтры</button>
            </div>
        `;
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = 'none';
        }
    }

    resetFilters() {
        if (this.searchInput) this.searchInput.value = '';
        if (this.genreFilter) this.genreFilter.value = '';
        if (this.yearFilter) this.yearFilter.value = '';
        if (this.ratingFilter) this.ratingFilter.value = '';
        if (this.sortFilter) this.sortFilter.value = 'rating';
        this.loadAnime();
    }

    loadMore() {
        this.currentPage++;
        this.renderAnime();
    }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('catalog-grid')) {
        window.catalog = new Catalog();
        console.log('Catalog initialized');
    }
});