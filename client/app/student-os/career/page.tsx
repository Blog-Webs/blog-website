'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Briefcase, DollarSign, Award, Search, Filter, ExternalLink, MapPin, RefreshCw, Building2, Wifi } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useRoadmap } from '@/context/RoadmapContext';
import api from '@/lib/api';

type Job = {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  isRemote: boolean;
  type: string;
  salary: string;
  description: string;
  applyUrl: string;
  postedAt?: string;
  required?: string[];
  highlights?: string[];
  companyType: string;
};

const COMPANY_TYPES = [
  { key: 'product', label: 'Product', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
  { key: 'service', label: 'Service', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
  { key: 'fintech', label: 'FinTech', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { key: 'edutech', label: 'EduTech', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { key: 'manufacturing', label: 'Manufacturing', color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
  { key: 'other', label: 'Other', color: 'text-zinc-400 border-zinc-600 bg-zinc-800/60' },
];

const EXPERIENCE_LEVELS = [
  { key: '', label: 'All Levels' },
  { key: 'intern', label: 'Internship' },
  { key: 'entry', label: 'Entry Level' },
  { key: 'mid', label: 'Mid Level' },
  { key: 'senior', label: 'Senior' },
];

export default function CareerDashboard() {
  const { targetRole } = useRoadmap();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'jsearch' | 'mock' | ''>('');
  const [companyType, setCompanyType] = useState('product');
  const [experience, setExperience] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/student-os/career/jobs', {
        params: { companyType, experience, role: roleSearch, location: locationFilter },
      });
      setJobs(res.data?.jobs || []);
      setDataSource(res.data?.source || 'mock');
    } catch { setJobs([]); }
    finally { setLoading(false); }
  }, [companyType, experience, roleSearch, locationFilter]);

  useEffect(() => { fetchJobs(); }, [companyType, experience]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchJobs(); };
  const ctConfig = COMPANY_TYPES.find(c => c.key === companyType);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="text-blue-400" /> Career Market Hub
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time job openings for <strong className="text-zinc-200">{targetRole}</strong>.
          {dataSource === 'jsearch' && <span className="text-emerald-400 ml-2">● Live via JSearch</span>}
          {dataSource === 'mock' && <span className="text-amber-400 ml-2">● Demo data (add JSEARCH_API_KEY to server .env for live data)</span>}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0"><Award size={22} /></div>
          <div>
            <p className="text-xs text-zinc-400">Skill Match Score</p>
            <p className="text-2xl font-bold text-white">78%</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><Briefcase size={22} /></div>
          <div>
            <p className="text-xs text-zinc-400">Jobs Shown</p>
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0"><DollarSign size={22} /></div>
          <div>
            <p className="text-xs text-zinc-400">Avg. Salary Range</p>
            <p className="text-lg font-bold text-white">₹12 – 50 LPA</p>
          </div>
        </Card>
      </div>

      {/* Company Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {COMPANY_TYPES.map(ct => (
          <button
            key={ct.key}
            onClick={() => setCompanyType(ct.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              companyType === ct.key ? ct.color : 'text-zinc-400 border-zinc-700 bg-zinc-900/60 hover:border-zinc-600'
            }`}
          >
            <Building2 size={12} className="inline mr-1" /> {ct.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search role (e.g. React Developer)" className="pl-9" />
        </div>
        <Input value={locationFilter} onChange={e => setLocationFilter(e.target.value)} placeholder="Location (e.g. Bangalore, Remote)" className="sm:max-w-48" />
        <select
          value={experience}
          onChange={e => setExperience(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-zinc-600"
        >
          {EXPERIENCE_LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
        </select>
        <Button type="submit" variant="secondary" disabled={loading} className="gap-2">
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Filter size={14} />}
          Search
        </Button>
      </form>

      {/* Job Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Card key={i} className="h-48 animate-pulse bg-zinc-900" />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center text-zinc-500 text-sm">No jobs found for the selected filters.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <Card key={job.id} className="p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white">{job.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">{job.company}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {job.isRemote && (
                      <Badge className="text-[9px] py-0 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        <Wifi size={9} className="mr-1" /> Remote
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[9px] py-0">{job.type}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign size={11} /> {job.salary}</span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{job.description}</p>

                {job.required && job.required.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.required.slice(0, 4).map(skill => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">{skill}</span>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={() => window.open(job.applyUrl, '_blank', 'noopener,noreferrer')}
                variant="apple"
                size="sm"
                className="mt-4 w-full gap-2 text-xs"
              >
                Apply Now <ExternalLink size={12} />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Skill Demand Matrix */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Industry Skill Demand Matrix</h2>
        <div className="space-y-3 pt-2">
          {[
            { skill: 'React 19 & Next.js App Router', match: 95 },
            { skill: 'Node.js & Distributed Systems', match: 85 },
            { skill: 'Redis Caching & Kafka Streams', match: 60 },
            { skill: 'Docker & Kubernetes Pipelines', match: 45 },
            { skill: 'TypeScript & System Design', match: 88 },
          ].map(item => (
            <div key={item.skill} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-200">{item.skill}</span>
                <span className="text-blue-400 font-bold">{item.match}% Match</span>
              </div>
              <Progress value={item.match} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}