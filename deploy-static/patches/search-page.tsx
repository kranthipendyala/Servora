"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BusinessCard from "@/components/business/BusinessCard";
import type { BreadcrumbItem, Business, Category, City } from "@/types";
import { SITE_NAME } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://obesityworldconference.com/mechanical/api/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const cityFilter = searchParams.get("city") || "";
  const categoryFilter = searchParams.get("category") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const sort = searchParams.get("sort") || "";
  const pageStr = searchParams.get("page") || "1";
  const page = parseInt(pageStr, 10) || 1;

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Search${query ? ` "${query}"` : ""} | ${SITE_NAME}`;
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (cityFilter) params.set("city", cityFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        if (ratingFilter) params.set("rating", ratingFilter);
        if (sort) params.set("sort", sort);
        params.set("page", pageStr);

        const [searchRes, catRes, cityRes] = await Promise.all([
          fetch(`${API_URL}/search?${params.toString()}`).then((r) => r.json()),
          fetch(`${API_URL}/categories`).then((r) => r.json()),
          fetch(`${API_URL}/cities`).then((r) => r.json()),
        ]);

        if (searchRes.status) {
          setBusinesses(searchRes.data?.businesses || searchRes.data || []);
          setTotalPages(searchRes.data?.pagination?.total_pages || 1);
          setTotalItems(searchRes.data?.pagination?.total_items || 0);
        }
        if (catRes.status) {
          setCategories(catRes.data?.categories || catRes.data || []);
        }
        if (cityRes.status) {
          setCities(cityRes.data?.cities || cityRes.data || []);
        }
      } catch {
        // Search failed silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, cityFilter, categoryFilter, ratingFilter, sort, pageStr]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Search Results", href: "/search", isCurrentPage: true },
  ];

  const queryParams: Record<string, string> = {};
  if (query) queryParams.q = query;
  if (cityFilter) queryParams.city = cityFilter;
  if (categoryFilter) queryParams.category = categoryFilter;
  if (ratingFilter) queryParams.rating = ratingFilter;
  if (sort) queryParams.sort = sort;

  const activeFilterCount = [cityFilter, categoryFilter, ratingFilter].filter(Boolean).length;

  return (
    <>
      <div className="container mx-auto px-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="bg-white border-b border-surface-200 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {query ? (
              <>Search results for &ldquo;{query}&rdquo;</>
            ) : (
              "Search Mechanical Services"
            )}
            {cityFilter && (
              <span className="text-primary-500"> in {cityFilter}</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading
              ? "Searching..."
              : totalItems > 0
                ? `Found ${totalItems} results`
                : "No results found"}
          </p>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
              {/* City Filter */}
              {cities.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    City
                  </h3>
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {cities.slice(0, 15).map((city: any) => (
                      <li key={city.id}>
                        <Link
                          href={`/search?${new URLSearchParams({ ...queryParams, city: city.slug, page: "1" }).toString()}`}
                          className={`text-sm py-1.5 px-2 block rounded-lg transition-all ${
                            cityFilter === city.slug
                              ? "bg-primary-50 text-primary-600 font-semibold"
                              : "text-gray-600 hover:bg-surface-50 hover:text-primary-500"
                          }`}
                        >
                          {city.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                    Category
                  </h3>
                  <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {categories.slice(0, 15).map((cat: any) => (
                      <li key={cat.id}>
                        <Link
                          href={`/search?${new URLSearchParams({ ...queryParams, category: cat.slug, page: "1" }).toString()}`}
                          className={`text-sm py-1.5 px-2 block rounded-lg transition-all ${
                            categoryFilter === cat.slug
                              ? "bg-primary-50 text-primary-600 font-semibold"
                              : "text-gray-600 hover:bg-surface-50 hover:text-primary-500"
                          }`}
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rating Filter */}
              <div className="card p-5">
                <h3 className="font-heading font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rating
                </h3>
                <ul className="space-y-1">
                  {[4, 3, 2].map((r) => (
                    <li key={r}>
                      <Link
                        href={`/search?${new URLSearchParams({ ...queryParams, rating: String(r), page: "1" }).toString()}`}
                        className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg transition-all ${
                          ratingFilter === String(r)
                            ? "bg-primary-50 text-primary-600 font-semibold"
                            : "text-gray-600 hover:bg-surface-50 hover:text-primary-500"
                        }`}
                      >
                        {r}+ Stars
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Filters */}
              {activeFilterCount > 0 && (
                <div className="card p-5 bg-primary-50 border-primary-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-semibold text-primary-800 text-sm">
                      Active Filters ({activeFilterCount})
                    </h3>
                    <Link
                      href={`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear All
                    </Link>
                  </div>
                </div>
              )}
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
                  <p className="text-gray-400 text-sm">
                    {query ? `No results for "${query}". Try different keywords.` : "Enter a search term to find services."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {businesses.map((biz: any) => (
                    <BusinessCard key={biz.id} business={biz} layout="list" />
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-6">
                      {page > 1 && (
                        <Link
                          href={`/search?${new URLSearchParams({ ...queryParams, page: String(page - 1) }).toString()}`}
                          className="px-4 py-2 rounded-lg border border-surface-200 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          Previous
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </span>
                      {page < totalPages && (
                        <Link
                          href={`/search?${new URLSearchParams({ ...queryParams, page: String(page + 1) }).toString()}`}
                          className="px-4 py-2 rounded-lg border border-surface-200 text-sm hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
