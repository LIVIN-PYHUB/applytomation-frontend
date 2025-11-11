import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Clock, Zap, Target, TrendingUp } from 'lucide-react';

interface ComingSoonProps {
  featureName?: string;
  description?: string;
}

export default function ComingSoon({ 
  featureName = "This Feature", 
  description = "We're working hard to bring you this amazing feature soon!" 
}: ComingSoonProps) {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed and performance"
    },
    {
      icon: Target,
      title: "Precision Built",
      description: "Designed with your needs in mind"
    },
    {
      icon: TrendingUp,
      title: "Always Improving",
      description: "Continuous updates and enhancements"
    }
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
            </div>
            {/* Glowing effect */}
            <div className="absolute inset-0 w-32 h-32 mx-auto bg-blue-400 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
          </div>

          {/* Main Message */}
          <div className="mb-8">
            <h1 className="text-5xl font-black text-gray-900 mb-4">
              Coming Soon
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <p className="text-2xl font-bold text-gray-700">
                {featureName} is on the way!
              </p>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="bg-gray-200 rounded-full h-3 max-w-md mx-auto overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-3 font-medium">75% Complete</p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Stay tuned for updates! We'll notify you when this feature is ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

