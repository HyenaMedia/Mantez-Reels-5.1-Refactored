import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, ArrowRight, Play, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProjectCard = ({ project }) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gray-900 transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-900/30 cursor-pointer">
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg shadow-yellow-500/30 text-white">
              Featured
            </Badge>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-500"></div>

        {/* Centered Play Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 pointer-events-none">
          <div className="relative">
            <div className="absolute -inset-8">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping"></div>
              <div
                className="absolute inset-2 border-2 border-purple-400/30 rounded-full animate-pulse"
                style={{ animationDuration: '2s' }}
              ></div>
            </div>
            <div className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border-2 border-white/30 shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
              <Play className="text-white relative z-10 ml-1.5" size={36} fill="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 group-hover:opacity-80 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-transparent"></div>
        <div className="relative backdrop-blur-sm border-t border-white/10 p-6">
          <Badge className="mb-3 bg-purple-600 text-white border-0 shadow-lg text-xs px-3 py-1">
            {project.category}
          </Badge>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100">
            <p className="text-gray-300 mb-2 text-sm line-clamp-2">{project.description}</p>
            <p className="text-gray-400 text-xs mb-3 flex items-center gap-2">
              <span className="text-purple-400">{project.client}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span>{project.year}</span>
            </p>
          </div>
          <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-12 opacity-0 group-hover:opacity-100 pt-2 border-t border-white/5">
            <button className="text-white hover:text-purple-300 text-sm font-medium flex items-center gap-2 transition-colors">
              View Project
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [categories, setCategories] = useState(['All']);
  const { toast } = useToast();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProjectsInit = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/portfolio/list`, { signal: controller.signal });
        if (response.data.items && response.data.items.length > 0) {
          setProjects(response.data.items);

          // Extract unique categories
          const uniqueCategories = [
            'All',
            ...new Set(response.data.items.map((item) => item.category)),
          ];
          setCategories(uniqueCategories);
        } else {
          // Demo data fallback
          const demoProjects = [
            {
              id: 'demo-1',
              title: 'Summer Brand Campaign',
              category: 'Commercial',
              thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: 'A vibrant summer campaign showcasing lifestyle and energy',
              client: 'Fashion Brand',
              year: '2024',
              featured: true,
            },
            {
              id: 'demo-2',
              title: 'Documentary Project',
              category: 'Documentary',
              thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: 'An intimate look into the lives of local artisans',
              client: 'Independent',
              year: '2024',
              featured: false,
            },
            {
              id: 'demo-3',
              title: 'Wedding Cinematography',
              category: 'Wedding',
              thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: 'Capturing the most beautiful moments of a special day',
              client: 'Private',
              year: '2024',
              featured: true,
            },
            {
              id: 'demo-4',
              title: 'Music Video Production',
              category: 'Music Video',
              thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: 'High-energy music video with creative visual storytelling',
              client: 'Recording Artist',
              year: '2024',
              featured: false,
            },
            {
              id: 'demo-5',
              title: 'Corporate Video',
              category: 'Corporate',
              thumbnail: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=800&q=80',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: 'Professional corporate presentation highlighting company values',
              client: 'Tech Company',
              year: '2024',
              featured: false,
            },
            {
              id: 'demo-6',
              title: 'Event Coverage',
              category: 'Event',
              thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              description: 'Full coverage of a major industry conference and networking',
              client: 'Conference Organizer',
              year: '2024',
              featured: true,
            },
          ];
          setProjects(demoProjects);
          setCategories([
            'All',
            'Commercial',
            'Documentary',
            'Wedding',
            'Music Video',
            'Corporate',
            'Event',
          ]);
        }
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') return;
        console.error('Failed to fetch projects:', error);
        toast({ title: 'Failed to load projects', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsInit();
    return () => controller.abort();
  }, []);

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((project) => project.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case 'az':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-6 lg:px-8 bg-gradient-to-b from-black via-purple-950/10 to-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="text-white">All </span>
              <span className="text-purple-400">Projects</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Explore our complete portfolio of cinematic stories
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-6 lg:px-8 bg-black/50 backdrop-blur-xl border-y border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-11 pr-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 transition-all min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-800 rounded-3xl mb-4"></div>
                  <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="text-gray-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No projects found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="bg-purple-600 hover:bg-purple-500"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-400 text-sm">
                Showing {filteredProjects.length}{' '}
                {filteredProjects.length === 1 ? 'project' : 'projects'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectsPage;
