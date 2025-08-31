
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

// FeatureCard Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">CodeCollab</h1>
          <div className="space-x-4">
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Code Together, Create Together
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time collaborative code editor with live cursors, instant sync, 
            and seamless project sharing
          </p>
          <div className="space-x-4">
            <Link to="/register" className="btn-primary">
              Start Coding Now
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard 
            icon="⚡" 
            title="Real-time Editing" 
            description="See changes instantly as your team codes together"
          />
          <FeatureCard 
            icon="🎨" 
            title="Syntax Highlighting" 
            description="Beautiful code highlighting for 20+ languages"
          />
          <FeatureCard 
            icon="🔗" 
            title="Easy Sharing" 
            description="Share projects with a simple link"
          />
        </div>

        {/* Demo Preview */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-2xl font-bold mb-4">See It In Action</h3>
          <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
            <p className="text-white">Editor Preview/Screenshot Here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
export default Home;
