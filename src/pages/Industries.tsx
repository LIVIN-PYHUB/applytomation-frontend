import { useState, useEffect } from 'react';
import { mastersDataApi } from '../services/api';
import { Plus, X } from 'lucide-react';
import Toast from '../components/Toast';

export default function Industries() {
  const [industries, setIndustries] = useState<any[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<Set<number>>(new Set());
  const [newIndustry, setNewIndustry] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const response = await mastersDataApi.getIndustries();
      setIndustries(response.data);
    } catch (error) {
      console.error('Error fetching industries:', error);
      setToast({ message: 'Failed to load industries', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIndustry = (industryId: number) => {
    const newSelected = new Set(selectedIndustries);
    if (newSelected.has(industryId)) {
      newSelected.delete(industryId);
    } else {
      newSelected.add(industryId);
    }
    setSelectedIndustries(newSelected);
  };

  const handleAddIndustry = async () => {
    if (!newIndustry.trim()) {
      setToast({ message: 'Please enter an industry name', type: 'error' });
      return;
    }

    try {
      const response = await mastersDataApi.createIndustry({ name: newIndustry.trim() });
      setIndustries([...industries, response.data]);
      setNewIndustry('');
      setShowAddForm(false);
      setToast({ message: '✅ Industry added successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to add industry'}`, type: 'error' });
    }
  };

  const commonIndustries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Transportation', 'Consulting', 'Real Estate', 'Legal Services',
    'Automotive', 'Fashion', 'Logistics', 'Publishing', 'Utilities',
    'Telecommunications', 'Media & Entertainment', 'Aerospace', 'Construction',
    'Gaming', 'Non-Profit', 'Sports', 'Energy', 'Hospitality', 'Agriculture',
    'E-commerce', 'Insurance', 'Pharmaceuticals', 'Travel', 'Biotechnology',
    'Food & Beverage', 'Marketing', 'Research'
  ];

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Industries</h1>
      <p className="text-gray-600 mb-6">Select all industries you're interested in</p>

      {loading ? (
        <div className="text-center py-8">Loading industries...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => handleToggleIndustry(industry.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedIndustries.has(industry.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {industry.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Add Custom Industry</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {showAddForm ? 'Cancel' : 'Add Industry'}
              </button>
            </div>

            {showAddForm && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Enter industry name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIndustry()}
                />
                <button
                  onClick={handleAddIndustry}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Quick Add Common Industries:</p>
              <div className="flex flex-wrap gap-2">
                {commonIndustries
                  .filter(name => !industries.some(i => i.name.toLowerCase() === name.toLowerCase()))
                  .map((name) => (
                    <button
                      key={name}
                      onClick={async () => {
                        try {
                          const response = await mastersDataApi.createIndustry({ name });
                          setIndustries([...industries, response.data]);
                          setToast({ message: `✅ ${name} added!`, type: 'success' });
                        } catch (error: any) {
                          setToast({ message: `❌ Failed to add ${name}`, type: 'error' });
                        }
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                    >
                      + {name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

