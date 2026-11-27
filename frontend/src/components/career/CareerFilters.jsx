import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export function CareerFilters({
  filters,
  onFilterChange,
  preferences,
  onPreferenceChange,
  categories,
  industries,
  skills,
  onReset,
}) {
  return (
    <section className="rounded-3xl border-2 border-ink bg-white p-5 shadow-brutal-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-ink">
          <Filter className="w-3.5 h-3.5" />
          <span>Search &amp; Role Filters (Instant Client Filtering)</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Category */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Job Category</span>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="input-base w-full"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        {/* Experience Level */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Experience Level</span>
          <select
            value={filters.experienceLevel}
            onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
            className="input-base w-full"
          >
            <option value="all">All Levels</option>
            <option value="Student">Student</option>
            <option value="Intern">Intern</option>
            <option value="Fresher">Fresher</option>
            <option value="Entry-level">Entry-level</option>
            <option value="Junior professional">Junior professional</option>
            <option value="Mid-level professional">Mid-level professional</option>
            <option value="Senior professional">Senior professional</option>
          </select>
        </label>

        {/* Job Type (Updates external search links immediately) */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Job Type</span>
          <select
            value={preferences.jobType}
            onChange={(e) => onPreferenceChange('jobType', e.target.value)}
            className="input-base w-full"
          >
            <option value="any">Any Type</option>
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </label>

        {/* Work Mode */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Work Mode</span>
          <select
            value={preferences.workMode}
            onChange={(e) => onPreferenceChange('workMode', e.target.value)}
            className="input-base w-full"
          >
            <option value="any">Any (Remote / Hybrid / On-site)</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </label>

        {/* Location Type */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Location Scope</span>
          <select
            value={preferences.locationType}
            onChange={(e) => onPreferenceChange('locationType', e.target.value)}
            className="input-base w-full"
          >
            <option value="none">Location-Independent</option>
            <option value="india">India</option>
            <option value="city">Specific City</option>
            <option value="remote">Remote Only</option>
            <option value="worldwide">Worldwide</option>
            <option value="custom">Custom Location</option>
          </select>
        </label>

        {/* City / Custom Location Input */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">City / Region (Optional)</span>
          <input
            type="text"
            value={preferences.location}
            onChange={(e) => onPreferenceChange('location', e.target.value)}
            placeholder="e.g. Bengaluru, Mumbai, London"
            disabled={!['city', 'custom'].includes(preferences.locationType)}
            className="input-base w-full disabled:opacity-50"
          />
        </label>

        {/* Industry */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Industry</span>
          <select
            value={filters.industry}
            onChange={(e) => onFilterChange('industry', e.target.value)}
            className="input-base w-full"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </label>

        {/* Technical Skill */}
        <label className="space-y-1">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">Skill Filter</span>
          <select
            value={filters.skill}
            onChange={(e) => onFilterChange('skill', e.target.value)}
            className="input-base w-full"
          >
            <option value="all">All Skills</option>
            {skills.map((sk) => (
              <option key={sk} value={sk}>{sk}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-ink/10 text-xs">
        <label className="flex items-center gap-3">
          <span className="font-mono font-bold text-ink-muted uppercase text-[10px]">
            Min Estimated Match: {filters.minMatch}%
          </span>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={filters.minMatch}
            onChange={(e) => onFilterChange('minMatch', Number(e.target.value))}
            className="accent-ink cursor-pointer"
          />
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-ink">
          <input
            type="checkbox"
            checked={filters.savedOnly}
            onChange={(e) => onFilterChange('savedOnly', e.target.checked)}
            className="rounded border-ink"
          />
          <span>Show Saved Roles Only</span>
        </label>
      </div>
    </section>
  );
}
