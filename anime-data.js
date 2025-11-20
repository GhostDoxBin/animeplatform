// Anime data and management
class AnimeData {
    constructor() {
        this.animeList = this.getAnimeData();
        this.favorites = JSON.parse(localStorage.getItem('animeFavorites')) || [];
    }

    getAnimeData() {
        return [
            {
                id: 1,
                title: "Наруто",
                rating: 8.3,
                year: 2002,
                episodes: 220,
                genre: "Сёнен",
                status: "Завершено",
                studio: "Studio Pierrot",
                description: "Наруто Узумаки - молодой ниндзя, который мечтает стать Хокаге, лидером своей деревни. Его путь полон приключений, битв и дружбы.",
                poster: "https://images.unsplash.com/photo-1578632749014-ca77efd052eb?w=400&h=600&fit=crop",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                episodesList: this.generateEpisodes(10, "Наруто")
            },
            {
                id: 2,
                title: "Атака титанов",
                rating: 9.0,
                year: 2013,
                episodes: 75,
                genre: "Драма",
                status: "Завершено",
                studio: "Wit Studio, MAPPA",
                description: "Человечество живет в городах, окруженных гигантскими стенами, защищающими от титанов. Эрен Йегер клянется уничтожить всех титанов.",
                poster: "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?w=400&h=600&fit=crop",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                episodesList: this.generateEpisodes(10, "Атака титанов")
            },
            {
                id: 3,
                title: "Моя геройская академия",
                rating: 8.5,
                year: 2016,
                episodes: 113,
                genre: "Сёнен",
                status: "Онгоинг",
                studio: "Bones",
                description: "В мире, где у большинства людей есть сверхспособности, мальчик без сил мечтает стать величайшим героем.",
                poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                episodesList: this.generateEpisodes(10, "Моя геройская академия")
            },
            {
                id: 4,
                title: "Ван Пис",
                rating: 8.7,
                year: 1999,
                episodes: 1000,
                genre: "Приключения",
                status: "Онгоинг",
                studio: "Toei Animation",
                description: "Монки Д. Луффи и его команда пиратов ищут легендарное сокровище Ван Пис, чтобы стать Королем Пиратов.",
                poster: "https://images.unsplash.com/photo-1636516449936-4ffc70b756ff?w=400&h=600&fit=crop",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                episodesList: this.generateEpisodes(10, "Ван Пис")
            },
            {
                id: 5,
                title: "Токийский гуль",
                rating: 8.2,
                year: 2014,
                episodes: 48,
                genre: "Ужасы",
                status: "Завершено",
                studio: "Studio Pierrot",
                description: "Студент Кэн Канеки становится полу-гулем после встречи с загадочным существом и вынужден жить между двумя мирами.",
                poster: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=600&fit=crop",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                episodesList: this.generateEpisodes(10, "Токийский гуль")
            },
            {
                id: 6,
                title: "Магическая битва",
                rating: 8.8,
                year: 2020,
                episodes: 24,
                genre: "Фэнтези",
                status: "Онгоинг",
                studio: "MAPPA",
                description: "Юджи Итородзи попадает в мир магии и проклятий после съедения пальца могущественного проклятия Рёмена Сукуны.",
                poster: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop",
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                episodesList: this.generateEpisodes(10, "Магическая битва")
            }
        ];
    }

    generateEpisodes(count, title) {
        const episodes = [];
        for (let i = 1; i <= count; i++) {
            episodes.push({
                number: i,
                title: `${title} - Эпизод ${i}`,
                duration: "24:00",
                thumbnail: `https://via.placeholder.com/300x169/333/fff?text=Эпизод+${i}`
            });
        }
        return episodes;
    }

    getAnimeById(id) {
        return this.animeList.find(anime => anime.id === parseInt(id));
    }

    searchAnime(query, filters = {}) {
        let results = this.animeList.filter(anime => {
            const matchesSearch = anime.title.toLowerCase().includes(query.toLowerCase()) ||
                                anime.description.toLowerCase().includes(query.toLowerCase());
            
            const matchesGenre = !filters.genre || anime.genre === filters.genre;
            const matchesYear = !filters.year || anime.year.toString() === filters.year;
            const matchesRating = !filters.rating || anime.rating >= parseFloat(filters.rating);
            
            return matchesSearch && matchesGenre && matchesYear && matchesRating;
        });

        // Sort results
        if (filters.sort) {
            results.sort((a, b) => {
                switch (filters.sort) {
                    case 'rating':
                        return b.rating - a.rating;
                    case 'year':
                        return b.year - a.year;
                    case 'title':
                        return a.title.localeCompare(b.title);
                    default:
                        return 0;
                }
            });
        }

        return results;
    }

    toggleFavorite(animeId) {
        const index = this.favorites.indexOf(animeId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(animeId);
        }
        localStorage.setItem('animeFavorites', JSON.stringify(this.favorites));
        return !this.isFavorite(animeId);
    }

    isFavorite(animeId) {
        return this.favorites.includes(animeId);
    }

    getFavorites() {
        return this.animeList.filter(anime => this.favorites.includes(anime.id));
    }
}

// Create global instance
window.animeData = new AnimeData();