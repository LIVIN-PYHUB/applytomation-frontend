import { useState, useEffect } from 'react';
import { careerPortalsApi, mastersDataApi } from '../services/api';
import type { CareerPortal } from '../types';
import Loading from '../components/Loading';
import { Building2, MapPin, Users, X, ExternalLink, DollarSign, Calendar, Info, Sparkles, TrendingUp, Award, Filter, Search as SearchIcon, CheckCircle2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/EnhancedToast';

export default function Companies() {
  const [companies, setCompanies] = useState<CareerPortal[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    industry: '',
    company_size: '',
    tier: '',
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CareerPortal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const { toasts, removeToast, success, info, warning, error } = useToast();

  // Fetch master data on mount only
  useEffect(() => {
    fetchMasterData();
  }, []);

  // Fetch companies when filters change
  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  // Close modal when user returns to the page after navigating away
  useEffect(() => {
    let blurTime: number | null = null;

    const handleBlur = () => {
      // Record when user navigates away
      if (showModal) {
        blurTime = Date.now();
      }
    };

    const handleFocus = () => {
      // Close modal if user was away for more than 1 second (likely clicked external link)
      if (showModal && blurTime && Date.now() - blurTime > 1000) {
        setShowModal(false);
        setSelectedCompany(null);
      }
      blurTime = null;
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [showModal]);

  const fetchMasterData = async () => {
    try {
      setLoadingMasterData(true);
      console.log('Fetching master data...');
      
      const [countriesRes, industriesRes] = await Promise.all([
        mastersDataApi.getCountries().catch(err => {
          console.error('Error fetching countries:', err);
          return { data: [] };
        }),
        mastersDataApi.getIndustries().catch(err => {
          console.error('Error fetching industries:', err);
          return { data: [] };
        }),
      ]);
      
      const countriesData = countriesRes?.data || [];
      const industriesData = industriesRes?.data || [];
      
      setCountries(countriesData);
      setIndustries(industriesData);
      
      console.log('Master data loaded:', { 
        countries: countriesData.length, 
        industries: industriesData.length,
        countriesList: countriesData.map(c => c.name),
        industriesList: industriesData.map(i => i.name)
      });
      
      if (countriesData.length === 0) {
        console.warn('⚠️ No countries found. Run the SQL insert script.');
      }
      if (industriesData.length === 0) {
        console.warn('⚠️ No industries found. Run the SQL insert script.');
      }
    } catch (error: any) {
      console.error('Error fetching master data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setCountries([]);
      setIndustries([]);
    } finally {
      setLoadingMasterData(false);
    }
  };

  // Fetch states when country is selected
  useEffect(() => {
    if (selectedCountryId) {
      console.log('Fetching states for country ID:', selectedCountryId);
      mastersDataApi.getStates(selectedCountryId)
        .then(res => {
          const statesData = res?.data || [];
          setStates(statesData);
          console.log('States loaded:', statesData.length, statesData.map(s => s.name));
        })
        .catch(err => {
          console.error('Error fetching states:', err);
          console.error('Error details:', err.response?.data || err.message);
          setStates([]);
        });
    } else {
      setStates([]);
      setSelectedStateId(null);
    }
  }, [selectedCountryId]);

  // Fetch cities when country or state is selected
  useEffect(() => {
    if (selectedCountryId) {
      console.log('Fetching cities for country ID:', selectedCountryId, 'state ID:', selectedStateId);
      mastersDataApi.getCities(selectedCountryId, selectedStateId || undefined)
        .then(res => {
          const citiesData = res?.data || [];
          setCities(citiesData);
          console.log('Cities loaded:', citiesData.length, citiesData.map(c => c.name));
        })
        .catch(err => {
          console.error('Error fetching cities:', err);
          console.error('Error details:', err.response?.data || err.message);
          setCities([]);
        });
    } else {
      setCities([]);
    }
  }, [selectedCountryId, selectedStateId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.city) params.city = filters.city;
      if (filters.industry) params.industry = filters.industry;
      if (filters.company_size) params.company_size = filters.company_size;
      if (filters.tier) params.tier = parseInt(filters.tier);
      
      const response = await careerPortalsApi.getAll(params);
      const companiesData = response.data || [];
      setCompanies(companiesData);
      console.log('Companies loaded:', companiesData.length);
      if (companiesData.length === 0 && Object.keys(params).length === 0) {
        console.warn('No companies found. Make sure you have run the SQL insert script or added career portals.');
      }
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
      if (error.response) {
        console.error('API Error:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverIndiaPortals = async () => {
    try {
      setDiscovering(true);
      info('Discovering India career portals... This may take a moment.', 5000);
      
      const response = await careerPortalsApi.discoverIndia(50);
      const result = response.data;
      
      if (result.added > 0) {
        success(
          `✅ Successfully imported ${result.added} India career portals! ${result.skipped > 0 ? `${result.skipped} were already in the database.` : ''}`,
          6000
        );
        // Refresh the company list
        await fetchCompanies();
      } else if (result.skipped > 0) {
        info(`All discovered portals (${result.skipped}) already exist in the database.`, 4000);
      } else {
        warning('No career portals were discovered. Please try again later.', 4000);
      }
    } catch (err: any) {
      console.error('Error discovering India portals:', err);
      error(err.response?.data?.detail || err.message || 'Failed to discover India portals');
    } finally {
      setDiscovering(false);
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 2: return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 3: return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getCompanyLogo = (companyName: string) => {
    if (!companyName) return '?';
    const words = companyName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return companyName.substring(0, 2).toUpperCase();
  };

  const getCompanyLogoColor = (companyName: string) => {
    // Simple, professional colors
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-gray-100 text-gray-700',
      'bg-slate-100 text-slate-700',
      'bg-zinc-100 text-zinc-700',
    ];
    if (!companyName) return colors[0];
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getIndustryIcon = (industry: string | null) => {
    if (!industry) return Building2;
    const industryLower = industry.toLowerCase();
    if (industryLower.includes('tech') || industryLower.includes('it') || industryLower.includes('software')) {
      return Sparkles;
    }
    if (industryLower.includes('finance') || industryLower.includes('fintech') || industryLower.includes('bank')) {
      return TrendingUp;
    }
    return Building2;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer toasts={toasts || []} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600 text-sm mt-1">Discover career opportunities from top companies</p>
            </div>
          </div>
          <button
            onClick={handleDiscoverIndiaPortals}
            disabled={discovering}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
            title="Discover and import India career portals"
          >
            {discovering ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Discovering...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Discover India Portals
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <p className="text-sm text-gray-600">Refine your search by location, industry, and more</p>
            </div>
          </div>
          {Object.values(filters).some(f => f) && (
            <button
              onClick={() => {
                setFilters({
                  country: '',
                  state: '',
                  city: '',
                  industry: '',
                  company_size: '',
                  tier: '',
                });
                setSelectedCountryId(null);
                setSelectedStateId(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        {loadingMasterData && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading filter options...
            </p>
          </div>
        )}
        {countries.length === 0 && industries.length === 0 && !loadingMasterData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ No master data found. Please run the SQL insert script to populate countries, states, cities, and industries.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
            <select
              value={filters.country}
              onChange={(e) => {
                const countryName = e.target.value;
                const country = countries.find(c => c.name === countryName);
                setSelectedCountryId(country ? country.id : null);
                setSelectedStateId(null);
                setFilters({ ...filters, country: countryName, state: '', city: '' });
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors bg-white"
              disabled={loadingMasterData}
            >
              <option value="">{loadingMasterData ? 'Loading...' : 'All Countries'}</option>
              {countries.length > 0 ? (
                countries.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              ) : (
                !loadingMasterData && <option value="" disabled>No countries available</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">State</label>
            <select
              value={filters.state || ''}
              onChange={(e) => {
                const stateName = e.target.value;
                const state = states.find(s => s.name === stateName);
                setSelectedStateId(state ? state.id : null);
                setFilters({ ...filters, state: stateName, city: '' });
              }}
              onFocus={() => {
                if (!selectedCountryId) {
                  info('Please select a country first to view states.', 3000);
                }
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 text-sm transition-colors"
              disabled={!selectedCountryId || loadingMasterData}
              title={!selectedCountryId ? 'Please select a country first' : ''}
            >
              <option value="">
                {!selectedCountryId 
                  ? 'Select Country First' 
                  : states.length === 0 
                    ? 'No States Available' 
                    : 'All States'}
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
            <select
              value={filters.city}
              onChange={(e) => {
                const cityName = e.target.value;
                setFilters({ ...filters, city: cityName });
              }}
              onFocus={() => {
                if (!selectedCountryId) {
                  info('Please select a country first, then a state, to view cities.', 3000);
                } else if (!selectedStateId) {
                  info('Please select a state first to view cities.', 3000);
                }
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 text-sm transition-colors"
              disabled={!selectedCountryId || !selectedStateId || loadingMasterData}
              title={!selectedCountryId ? 'Please select country and state first' : !selectedStateId ? 'Please select a state first' : ''}
            >
              <option value="">
                {!selectedCountryId 
                  ? 'Select Country First' 
                  : !selectedStateId
                    ? 'Select State First'
                    : cities.length === 0 
                      ? 'No Cities Available' 
                      : 'All Cities'}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors bg-white"
              disabled={loadingMasterData}
            >
              <option value="">{loadingMasterData ? 'Loading...' : 'All Industries'}</option>
              {industries.length > 0 ? (
                industries.map((i) => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))
              ) : (
                !loadingMasterData && <option value="" disabled>No industries available</option>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Company Size</label>
            <select
              value={filters.company_size}
              onChange={(e) => setFilters({ ...filters, company_size: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors bg-white"
            >
              <option value="">All Sizes</option>
              <option value="1-50">1-50 employees</option>
              <option value="50-100">50-100 employees</option>
              <option value="100-500">100-500 employees</option>
              <option value="500-1000">500-1000 employees</option>
              <option value="1000-5000">1000-5000 employees</option>
              <option value="5000+">5000+ employees</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors bg-white"
            >
              <option value="">All Tiers</option>
              <option value="1">Tier 1</option>
              <option value="2">Tier 2</option>
              <option value="3">Tier 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Company Cards Grid */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Company List</h2>
              <p className="text-sm text-gray-600 mt-1">Browse career portals and company opportunities</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 shadow-sm">
            <Loading message="Loading companies..." />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">No companies found</p>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters or clear them to see all companies.'
                : 'Add career portals in the Configure page to get started, or run the SQL insert script to add pre-configured portals.'}
            </p>
            {Object.values(filters).some(f => f) && (
              <button
                onClick={() => {
                  setFilters({
                    country: '',
                    state: '',
                    city: '',
                    industry: '',
                    company_size: '',
                    tier: '',
                  });
                  setSelectedCountryId(null);
                  setSelectedStateId(null);
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => {
              const companyName = company.company_name || company.name || 'Unnamed Company';
              const IndustryIcon = getIndustryIcon(company.industry);
              const logoColor = getCompanyLogoColor(companyName);
              
              return (
              <div 
                key={company.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                {/* Company Header with Logo */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Company Logo/Avatar */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-lg ${getCompanyLogoColor(companyName)} flex items-center justify-center font-semibold text-lg border border-gray-200`}>
                    {getCompanyLogo(companyName)}
                  </div>
                  
                  {/* Company Name & Badge */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {companyName}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {company.industry && (
                        <span className="text-xs text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200">
                          {company.industry}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getTierColor(company.tier)}`}>
                        Tier {company.tier || 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-2 mb-4">
                  {company.city && company.country && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{company.city}, {company.country}</span>
                    </div>
                  )}
                  
                  {company.company_size && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{company.company_size} employees</span>
                    </div>
                  )}

                  {(company.salary_min || company.salary_max) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>
                        {company.salary_min && company.salary_max
                          ? `$${company.salary_min.toLocaleString()} - $${company.salary_max.toLocaleString()}`
                          : company.salary_min
                          ? `From $${company.salary_min.toLocaleString()}`
                          : `Up to $${company.salary_max?.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  {company.created_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Added: {company.created_at ? new Date(company.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  )}
                </div>

                {/* Description/Notes Preview */}
                {company.notes && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {company.notes.length > 100 ? `${company.notes.substring(0, 100)}...` : company.notes}
                  </p>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-200">
                  {company.url ? (
                    <a
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCompany(company);
                        setShowModal(true);
                      }}
                      className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
                    >
                      View Career Portal
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowModal(true);
                      }}
                      className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {showModal && selectedCompany && (
        <div 
          className="fixed inset-0 bg-blue-50/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowModal(false);
            setSelectedCompany(null);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all relative border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Simple header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-lg ${getCompanyLogoColor(selectedCompany.company_name || selectedCompany.name || 'Unnamed Company')} flex items-center justify-center font-semibold text-lg border border-gray-200`}>
                  {getCompanyLogo(selectedCompany.company_name || selectedCompany.name || 'Unnamed Company')}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedCompany.company_name || selectedCompany.name || 'Unnamed Company'}</h2>
                  {selectedCompany.industry && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{selectedCompany.industry}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(selectedCompany.tier)}`}>
                        Tier {selectedCompany.tier || 1}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {selectedCompany.url && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Career Portal URL</label>
                  <a 
                    href={selectedCompany.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Close modal when external link is clicked
                      setTimeout(() => {
                        setShowModal(false);
                        setSelectedCompany(null);
                      }, 100);
                    }}
                    className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-2 text-sm transition-colors hover:underline"
                  >
                    <span className="break-words flex-1">{selectedCompany.url}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedCompany.industry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <p className="text-gray-900">{selectedCompany.industry}</p>
                  </div>
                )}
                
                {selectedCompany.company_size && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                    <p className="text-gray-900">{selectedCompany.company_size} employees</p>
                  </div>
                )}

                {selectedCompany.city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <p className="text-gray-900">{selectedCompany.city}</p>
                  </div>
                )}

                {selectedCompany.country && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <p className="text-gray-900">{selectedCompany.country}</p>
                  </div>
                )}

                {selectedCompany.state && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <p className="text-gray-900">{selectedCompany.state}</p>
                  </div>
                )}

                {(selectedCompany.salary_min || selectedCompany.salary_max) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <p className="text-gray-900">
                      {selectedCompany.salary_min && selectedCompany.salary_max
                        ? `$${selectedCompany.salary_min.toLocaleString()} - $${selectedCompany.salary_max.toLocaleString()}`
                        : selectedCompany.salary_min
                        ? `From $${selectedCompany.salary_min.toLocaleString()}`
                        : `Up to $${selectedCompany.salary_max?.toLocaleString()}`}
                    </p>
                  </div>
                )}
              </div>

              {selectedCompany.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedCompany.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {selectedCompany.url && (
                <a
                  href={selectedCompany.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Close modal when external link is clicked
                    setTimeout(() => {
                      setShowModal(false);
                      setSelectedCompany(null);
                    }, 100);
                  }}
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                >
                  Visit Portal
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCompany(null);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

