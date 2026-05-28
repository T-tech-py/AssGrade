'use client';

import { useMemo, useState } from 'react';
import type { Assessment } from '@/data/student-dashboard';
import { AssessmentCard } from './assessment-card';
import { SearchIcon } from './icons';

type AssessmentFiltersProps = {
  assessments: Assessment[];
  onFilteredChange?: (count: number) => void;
};

const categories = ['All', 'Technology', 'Law', 'Engineering'] as const;

export function AssessmentFilters({ assessments, onFilteredChange }: AssessmentFiltersProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>('All');

  const filteredAssessments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assessments.filter((assessment) => {
      const matchesCategory =
        activeCategory === 'All' ? true : assessment.field === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : [assessment.title, assessment.field, assessment.description, assessment.difficulty]
              .join(' ')
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, assessments, query]);

  useMemo(() => {
    onFilteredChange?.(filteredAssessments.length);
  }, [filteredAssessments.length, onFilteredChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="dashboard-dark-button flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 lg:max-w-3xl">
          <SearchIcon className="h-4 w-4 text-[var(--dashboard-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, field, or difficulty"
            className="w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-muted)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'dashboard-lime-panel text-[#223200]'
                    : 'dashboard-dark-button'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {filteredAssessments.map((assessment) => (
          <div key={assessment.title}>
            <div className="h-full">
              {/* TODO: Replace with API-fed assessment results and server-side search when backend is ready. */}
              <AssessmentCard assessment={assessment} />
            </div>
          </div>
        ))}
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="dashboard-panel rounded-[1.7rem] px-5 py-8 text-center">
          <p className="text-lg font-semibold text-[var(--dashboard-text)]">No assessments match your search</p>
          <p className="mt-2 text-sm leading-6 text-[var(--dashboard-muted)]">
            Try another keyword or switch to a different category.
          </p>
        </div>
      ) : null}
    </div>
  );
}
