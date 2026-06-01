import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ContentCarousel from './components/ContentCarousel';
import ContentDetailsModal from './components/ContentDetailsModal';

// High-quality mock data focusing on Cyberpunk / Sci-Fi / Premium themes
const mockData = {
  trending: [
    {
      id: 1,
      type: 'movie',
      title: 'Blade Runner 2049',
      posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
      year: '2017',
      runtime: '2h 44m',
      rating: 4.7,
      description: 'A young blade runner discovers a secret that leads him to track down former blade runner Rick Deckard.',
      genres: ['Sci-Fi', 'Thriller', 'Neo-Noir'],
      director: 'Denis Villeneuve',
      cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas']
    },
    {
      id: 2,
      type: 'game',
      title: 'Cyberpunk 2077',
      posterUrl: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS1dtbBhNNHqyHAUugdokcqjmfvEZgr46h6oVQsLayl0K880gCw',
      year: '2020',
      developer: 'CD Projekt Red',
      rating: 4.3,
      description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
      genres: ['Action RPG', 'Open World', 'Cyberpunk'],
      cast: ['Keanu Reeves', 'Cherami Leigh', 'Gavin Drea']
    },
    {
      id: 3,
      type: 'movie',
      title: 'The Matrix',
      posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      year: '1999',
      runtime: '2h 16m',
      rating: 4.8,
      description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      genres: ['Sci-Fi', 'Action'],
      director: 'Lana Wachowski, Lilly Wachowski',
      cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss']
    },
    {
      id: 4,
      type: 'game',
      title: 'Ghostrunner',
      posterUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOkTeKt5Jb1h8kQSH2UdhVz8SjOsfkR9goQGLEHS0KyggI_6Fj',
      year: '2020',
      developer: 'One More Level',
      rating: 4.5,
      description: 'A hardcore FPP slasher packed with lightning-fast action, set in a grim, cyberpunk megastructure.',
      genres: ['Action', 'Platformer', 'Cyberpunk'],
    },
    {
      id: 5,
      type: 'movie',
      title: 'Altered Carbon',
      posterUrl: 'https://images.unsplash.com/photo-1563240619-44ce092fae9f?q=80&w=600&auto=format&fit=crop',
      year: '2018',
      runtime: 'Series',
      rating: 4.4,
      description: 'Set in a future where consciousness is digitized and stored, a prisoner returns to life in a new body and must solve a mind-bending murder.',
      genres: ['Sci-Fi', 'Cyberpunk', 'Mystery'],
      director: 'Laeta Kalogridis',
      cast: ['Joel Kinnaman', 'Anthony Mackie', 'Chris Conner']
    },
    {
      id: 6,
      type: 'game',
      title: 'Deus Ex: Mankind Divided',
      posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      year: '2016',
      developer: 'Eidos-Montréal',
      rating: 4.6,
      description: 'The year is 2029, and mechanically augmented humans have now been deemed outcasts, living a life of complete and total segregation.',
      genres: ['Action RPG', 'Stealth', 'Cyberpunk'],
    }
  ],
  recommended: [
    {
      id: 7,
      type: 'movie',
      title: 'Dune: Part Two',
      posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
      year: '2024',
      runtime: '2h 46m',
      rating: 4.9,
      description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
      genres: ['Sci-Fi', 'Adventure', 'Epic'],
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson']
    },
    {
      id: 8,
      type: 'game',
      title: 'Stray',
      posterUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
      year: '2022',
      developer: 'BlueTwelve Studio',
      rating: 4.8,
      description: 'Lost, alone and separated from family, a stray cat must untangle an ancient mystery to escape a long-forgotten cybercity and find their way home.',
      genres: ['Adventure', 'Cyberpunk', 'Indie'],
    },
    {
      id: 9,
      type: 'movie',
      title: 'Tron: Legacy',
      posterUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=600&auto=format&fit=crop',
      year: '2010',
      runtime: '2h 5m',
      rating: 4.2,
      description: 'The son of a virtual world designer goes looking for his father and ends up inside the digital world that his father designed.',
      genres: ['Sci-Fi', 'Action', 'Adventure'],
      director: 'Joseph Kosinski',
      cast: ['Jeff Bridges', 'Garrett Hedlund', 'Olivia Wilde']
    },
    {
      id: 10,
      type: 'game',
      title: 'Death Stranding',
      posterUrl: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=600&auto=format&fit=crop',
      year: '2019',
      developer: 'Kojima Productions',
      rating: 4.6,
      description: 'Sam Bridges must brave a world utterly transformed by the Death Stranding. Carrying the disconnected remnants of our future in his hands, he embarks on a journey to reconnect the shattered world one step at a time.',
      genres: ['Action', 'Sci-Fi', 'Adventure'],
    },
    {
      id: 11,
      type: 'movie',
      title: 'Akira',
      posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qK7qEUQ2T5G0lYg3gG8n6oZ93lY.jpg',
      year: '1988',
      runtime: '2h 4m',
      rating: 4.7,
      description: 'A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath.',
      genres: ['Animation', 'Sci-Fi', 'Action', 'Cyberpunk'],
      director: 'Katsuhiro Otomo',
    }
  ]
};

function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar isLoggedIn={isLoggedIn} onLoginToggle={() => setIsLoggedIn(!isLoggedIn)} />

      {isLoggedIn ? (
        <>
          <main>
            <HeroBanner />

            <div className="relative z-20 -mt-24 pb-12">
              <ContentCarousel
                title="Trending Now"
                items={mockData.trending}
                onItemClick={setSelectedItem}
              />
              <ContentCarousel
                title="Recommended for You"
                items={mockData.recommended}
                onItemClick={setSelectedItem}
              />
            </div>
          </main>

          <ContentDetailsModal
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Welcome to <span className="text-primary">KAIRO</span></h2>
          <p className="text-muted-foreground mb-8 max-w-md">Please click the profile icon in the top right to simulate logging in and view the catalog.</p>
          <button
            onClick={() => setIsLoggedIn(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            Log In to Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
