import { useState, useEffect } from 'react';
import { mastersDataApi } from '../services/api';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import Toast from '../components/Toast';
import Loading from '../components/Loading';

type MasterType = 'industry' | 'country' | 'state' | 'city' | 'tier';

interface MasterItem {
  id: number;
  name: string;
  country_id?: number;
  state_id?: number;
}

export default function AdminMasters() {
  const [activeTab, setActiveTab] = useState<MasterType>('industry');
  const [items, setItems] = useState<MasterItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    if (activeTab === 'city' || activeTab === 'state') {
      fetchCountries();
    }
  }, [activeTab, selectedCountry, selectedState]);

  const fetchCountries = async () => {
    try {
      const response = await mastersDataApi.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async (countryId: number) => {
    try {
      const response = await mastersDataApi.getStates(countryId);
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      let response;
      switch (activeTab) {
        case 'industry':
          response = await mastersDataApi.getIndustries();
          break;
        case 'country':
          response = await mastersDataApi.getCountries();
          break;
        case 'state':
          response = await mastersDataApi.getStates(selectedCountry || undefined);
          break;
        case 'city':
          response = await mastersDataApi.getCities(selectedCountry || undefined, selectedState || undefined);
          break;
        case 'tier':
          // Tier is a fixed list, but we can manage it
          setItems([
            { id: 1, name: 'Tier 1' },
            { id: 2, name: 'Tier 2' },
            { id: 3, name: 'Tier 3' },
          ]);
          setLoading(false);
          return;
        default:
          return;
      }
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      setToast({ message: 'Please enter a name', type: 'error' });
      return;
    }

    try {
      let response;
      switch (activeTab) {
        case 'industry':
          response = await mastersDataApi.createIndustry({ name: newName.trim() });
          break;
        case 'country':
          response = await mastersDataApi.createCountry({ name: newName.trim() });
          break;
        case 'state':
          if (!selectedCountry) {
            setToast({ message: 'Please select a country first', type: 'error' });
            return;
          }
          response = await mastersDataApi.createState({
            name: newName.trim(),
            country_id: selectedCountry,
          });
          break;
        case 'city':
          if (!selectedCountry) {
            setToast({ message: 'Please select a country first', type: 'error' });
            return;
          }
          response = await mastersDataApi.createCity({
            name: newName.trim(),
            country_id: selectedCountry,
            state_id: selectedState || undefined,
          });
          break;
        default:
          return;
      }
      setItems([...items, response.data]);
      setNewName('');
      setToast({ message: '✅ Item added successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to add item'}`, type: 'error' });
    }
  };

  const handleEdit = (item: MasterItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) {
      setToast({ message: 'Please enter a name', type: 'error' });
      return;
    }

    try {
      let response;
      switch (activeTab) {
        case 'industry':
          response = await mastersDataApi.updateIndustry(id, { name: editName.trim() });
          break;
        case 'country':
          response = await mastersDataApi.updateCountry(id, { name: editName.trim() });
          break;
        case 'state':
          response = await mastersDataApi.updateState(id, { name: editName.trim() });
          break;
        case 'city':
          response = await mastersDataApi.updateCity(id, { name: editName.trim() });
          break;
        default:
          return;
      }
      setItems(items.map(item => item.id === id ? response.data : item));
      setEditingId(null);
      setEditName('');
      setToast({ message: '✅ Item updated successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to update item'}`, type: 'error' });
    }
  };

  const handleSeedIndianData = async () => {
    if (!confirm('This will seed Indian master data (Countries, States, Cities, Industries). Continue?')) return;
    
    try {
      setSeeding(true);
      const response = await fetch('http://localhost:8000/admin/seed-indian-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to seed data');
      }
      
      const data = await response.json();
      setToast({ 
        message: `✅ ${data.message}. States: ${data.states_created}, Cities: ${data.cities_created}, Industries: ${data.industries_created}`, 
        type: 'success' 
      });
      fetchItems();
    } catch (error: any) {
      setToast({ message: `❌ ${error.message || 'Failed to seed Indian data'}`, type: 'error' });
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (activeTab) {
        case 'industry':
          await mastersDataApi.deleteIndustry(id);
          break;
        case 'country':
          await mastersDataApi.deleteCountry(id);
          break;
        case 'state':
          await mastersDataApi.deleteState(id);
          break;
        case 'city':
          await mastersDataApi.deleteCity(id);
          break;
        default:
          return;
      }
      setItems(items.filter(item => item.id !== id));
      setToast({ message: '✅ Item deleted successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to delete item'}`, type: 'error' });
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading master data..." />;
  }

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Data Management</h1>
          <p className="text-gray-600">Admin only - Manage Industry, Country, City, and Tier master data</p>
        </div>
        <button
          onClick={handleSeedIndianData}
          disabled={seeding}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {seeding ? 'Seeding...' : 'Seed Indian Data'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['industry', 'country', 'state', 'city', 'tier'] as MasterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedCountry(null);
              setSelectedState(null);
            }}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'tier' ? 'Tier' : tab === 'industry' ? 'Industry' : tab === 'country' ? 'Country' : tab === 'state' ? 'State' : 'City'}
          </button>
        ))}
      </div>

      {/* State and City filters */}
      {(activeTab === 'state' || activeTab === 'city') && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={selectedCountry || ''}
                onChange={(e) => {
                  const countryId = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedCountry(countryId);
                  if (countryId) {
                    fetchStates(countryId);
                  } else {
                    setStates([]);
                  }
                  setSelectedState(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {activeTab === 'city' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={selectedState || ''}
                  onChange={(e) => setSelectedState(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedCountry}
                >
                  <option value="">All States</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Item */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Enter new ${activeTab} name`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{item.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {activeTab !== 'tier' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
