import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import ProjectGrid from '../components/Project/ProjectGrid';
import CreateProjectModal from '../components/Project/CreateProjectModal';
import Loading from '../components/UI/Loading';
import Button from '../components/UI/Button';

function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, logout } = useAuth();
  const { projects, loadUserProjects, createProject } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await loadUserProjects();
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [loadUserProjects]);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setIsCreateModalOpen(false);
      // Navigate to the new project's editor
      navigate(`/editor/${newProject._id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Loading message="Loading your projects..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username || user?.email}
              </h1>
              <p className="text-gray-600">
                You have {projects.length} project{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="primary"
              >
                + New Project
              </Button>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Projects Section */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 
                ? 'Create your first project to get started'
                : 'Try adjusting your search query'
              }
            </p>
            {projects.length === 0 && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="primary"
              >
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <ProjectGrid 
            projects={filteredProjects}
            onProjectClick={(project) => navigate(`/editor/${project._id}`)}
          />
        )}
      </main>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}

export default Dashboard;