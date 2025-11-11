import { useState, useEffect } from 'react';
import { careerPortalsApi, mastersDataApi } from '../services/api';
import type { CareerPortal } from '../types';
import Loading from '../components/Loading';
import { Building2, MapPin, Users, X, ExternalLink, DollarSign, Calendar } from 'lucide-react';

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

  // Fetch master data on mount only
  useEffect(() => {
    fetchMasterData();
  }, []);

  // Fetch companies when filters change
  useEffect(() => {
    fetchCompanies();
  }, [filters]);

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

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 2: return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 3: return 'bg-purple-100 text-purple-800 border border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
        <p className="text-gray-600">Discover career opportunities from top companies</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
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
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
        {loadingMasterData && (
          <div className="mb-4 text-sm text-gray-500">Loading filter options...</div>
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
            <select
              value={filters.country}
              onChange={(e) => {
                const countryName = e.target.value;
                const country = countries.find(c => c.name === countryName);
                setSelectedCountryId(country ? country.id : null);
                setSelectedStateId(null);
                setFilters({ ...filters, country: countryName, state: '', city: '', industry: '' });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
            <select
              value={filters.state || ''}
              onChange={(e) => {
                const stateName = e.target.value;
                const state = states.find(s => s.name === stateName);
                setSelectedStateId(state ? state.id : null);
                setFilters({ ...filters, state: stateName, city: '' });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCountryId || loadingMasterData}
            >
              <option value="">
                {!selectedCountryId 
                  ? 'Select Country' 
                  : states.length === 0 
                    ? 'No States' 
                    : 'All States'}
              </option>
              {states.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCountryId || loadingMasterData}
            >
              <option value="">
                {!selectedCountryId 
                  ? 'Select Country' 
                  : cities.length === 0 
                    ? 'No Cities' 
                    : 'All Cities'}
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Size</label>
            <select
              value={filters.company_size}
              onChange={(e) => setFilters({ ...filters, company_size: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company List</h2>
          <p className="text-gray-600">Browse career portals and company opportunities</p>
        </div>
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <Loading message="Loading companies..." />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No companies found</p>
            <p className="text-sm mb-4">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div 
                key={company.id}
                className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200"
              >
                {/* Company Name & Tier Badge */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {company.company_name || company.name || 'Unnamed Company'}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {company.industry && (
                      <span className="text-sm text-gray-600 font-medium">
                        {company.industry}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(company.tier)}`}>
                      Tier {company.tier || 1}
                    </span>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-3 mb-4">
                  {company.city && company.country && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <span className="truncate">{company.city}, {company.country}</span>
                    </div>
                  )}
                  
                  {company.company_size && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <span>{company.company_size} employees</span>
                    </div>
                  )}

                  {(company.salary_min || company.salary_max) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 flex-shrink-0 text-gray-500" />
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0 text-gray-500" />
                      <span>Added: {new Date(company.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Description/Notes Preview */}
                {company.notes && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {company.notes.length > 100 ? `${company.notes.substring(0, 100)}...` : company.notes}
                  </p>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
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
                      className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
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
                      className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
                    >
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Company Detail Modal */}
      {showModal && selectedCompany && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
              <h2 className="text-2xl font-bold text-gray-800">Company Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-blue-100 rounded-full p-1 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedCompany.company_name || selectedCompany.name || 'Unnamed Company'}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTierColor(selectedCompany.tier)}`}>
                    Tier {selectedCompany.tier || 1}
                  </span>
                </div>
              </div>

              {selectedCompany.url && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <label className="block text-sm font-semibold text-blue-700 mb-3">Full Career Portal Name</label>
                  <div className="flex items-center gap-2">
                    <a 
                      href={selectedCompany.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 break-all flex items-center gap-2 font-medium transition-colors hover:underline"
                    >
                      <span className="break-words">{selectedCompany.url}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  </div>
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
                        : `Up to $${selectedCompany.salary_max.toLocaleString()}`}
                    </p>
                  </div>
                )}
              </div>

              {selectedCompany.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedCompany.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm hover:shadow-md font-medium"
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

