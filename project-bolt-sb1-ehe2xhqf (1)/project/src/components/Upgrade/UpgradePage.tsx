import React, { useState } from 'react';
import { Star, CreditCard, Smartphone, Building, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UpgradePage() {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'airtel', name: 'Airtel Money', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'credit', name: 'Credit Card', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'debit', name: 'Debit Card', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'bank', name: 'Bank Transfer', icon: <Building className="w-5 h-5" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      return;
    }

    setLoading(true);

    try {
      await updateProfile({ preferred_payment: selectedMethod });
      setSubmitted(true);
    } catch (error) {
      console.error('Error saving payment preference:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Our team will contact you shortly via email at{' '}
            <span className="font-medium text-gray-900">{profile?.email}</span>{' '}
            to complete your Pro upgrade via{' '}
            <span className="font-medium text-gray-900">
              {paymentMethods.find(m => m.id === selectedMethod)?.name}
            </span>.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Upgrade to Pro</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Pro Features */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AI StudyBuddy Pro</h1>
            <p className="text-white/90 text-lg">Unlock unlimited learning potential</p>
          </div>

          <div className="p-8">
            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                'Unlimited flashcard generations',
                'Advanced AI models',
                'Priority support',
                'Export flashcards to PDF',
                'Custom study sessions',
                'Progress analytics',
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Payment Method Selection */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select your preferred payment method:
                </h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {method.icon}
                        </div>
                        <span className="font-medium text-gray-900">{method.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedMethod || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? 'Processing...' : 'Continue with Selected Method'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              By proceeding, you agree that we'll contact you via email to complete the payment process.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}