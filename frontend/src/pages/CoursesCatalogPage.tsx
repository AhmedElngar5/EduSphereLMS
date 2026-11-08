import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { courseService } from '../services/courseService';
import { CourseCard } from '../components/common/CourseCard';
import { CourseCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';

export const CoursesCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const levelParam = searchParams.get('level') || '';
  const isFreeParam = searchParams.get('isFree') === 'true' ? true : searchParams.get('isFree') === 'false' ? false : undefined;
  const sortByParam = searchParams.get('sortBy') || 'newest';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(categoryParam);
  const [selectedLevel, setSelectedLevel] = useState<string>(levelParam);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>(
    isFreeParam === true ? 'free' : isFreeParam === false ? 'paid' : 'all'
  );
  const [sortBy, setSortBy] = useState<string>(sortByParam);
  const [page, setPage] = useState<number>(pageParam);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state to URL search parameters
  const updateQueryString = (newParams: Record<string, string | number | undefined | null>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '' || val === 'all') {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });
    setSearchParams(updated);
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => courseService.getCategories(),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['coursesCatalog', searchParam, selectedCategory, selectedLevel, priceFilter, sortBy, page],
    queryFn: () =>
      courseService.getCourses({
        search: searchParam || undefined,
        categoryId: selectedCategory,
        level: selectedLevel || undefined,
        isFree: priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
        sortBy,
        pageNumber: page,
        pageSize: 9,
      }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateQueryString({ search: searchTerm.trim() || undefined, page: 1 });
  };

  const handleCategorySelect = (catId?: number) => {
    setSelectedCategory(catId);
    setPage(1);
    updateQueryString({ categoryId: catId, page: 1 });
  };

  const handleLevelSelect = (level: string) => {
    const next = level === selectedLevel ? '' : level;
    setSelectedLevel(next);
    setPage(1);
    updateQueryString({ level: next || undefined, page: 1 });
  };

  const handlePriceSelect = (type: 'all' | 'free' | 'paid') => {
    setPriceFilter(type);
    setPage(1);
    updateQueryString({
      isFree: type === 'free' ? 'true' : type === 'paid' ? 'false' : undefined,
      page: 1,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPage(1);
    updateQueryString({ sortBy: newSort, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setSelectedLevel('');
    setPriceFilter('all');
    setSortBy('newest');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const courses = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const hasActiveFilters =
    Boolean(searchParam) ||
    Boolean(selectedCategory) ||
    Boolean(selectedLevel) ||
    priceFilter !== 'all' ||
    sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Courses Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore all certified courses designed for software engineers and architects.
        </p>
      </div>

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by title, topic, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                updateQueryString({ search: undefined });
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters Sidebar */}
        <aside
          className={`w-full lg:w-64 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs shrink-0 space-y-6 ${
            isMobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-600" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleCategorySelect(undefined)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex justify-between items-center ${
                  !selectedCategory
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
              </button>

              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {cat.courseCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Difficulty Level
            </h4>
            <div className="space-y-1">
              {['Beginner', 'Intermediate', 'Advanced', 'AllLevels'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleLevelSelect(lvl)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    selectedLevel === lvl
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{lvl === 'AllLevels' ? 'All Levels' : lvl}</span>
                  {selectedLevel === lvl && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Pricing
            </h4>
            <div className="flex flex-col space-y-1 text-xs">
              {[
                { id: 'all', label: 'All Pricing' },
                { id: 'free', label: 'Free Only' },
                { id: 'paid', label: 'Paid Courses' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePriceSelect(p.id as any)}
                  className={`text-left px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                    priceFilter === p.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{p.label}</span>
                  {priceFilter === p.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Courses Listing Content */}
        <main className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon="alert"
              title="Failed to load courses"
              description="There was an error communicating with the backend API."
              actionLabel="Try Again"
              onAction={() => refetch()}
            />
          ) : courses.length === 0 ? (
            <EmptyState
              icon="search"
              title="No courses found"
              description="No published courses match your current search and filter criteria."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={9}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  updateQueryString({ page: newPage });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

