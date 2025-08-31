import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import MonacoEditor from '../components/Editor/MonacoEditor';
import Loading from '../components/UI/Loading';

function Editor() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { project, loadProject } = useProject();
  
  const [isLoading, setIsLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('// Start coding here...\nconsole.log("Hello, World!");');
  
  const navigate = useNavigate();

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Simulate loading project
        await new Promise(resolve => setTimeout(resolve, 1000));
        loadProject({
          id: projectId,
          name: `Project ${projectId}`,
          files: []
        });
      } catch (error) {
        console.error('Failed to load project:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, loadProject, navigate]);

  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  if (isLoading) {
    return <Loading message="Loading project..." />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">
            {project?.name || `Project ${projectId}`}
          </span>
        </div>
        
        <div className="ml-auto flex items-center space-x-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white text-sm"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="flex-1">
        <MonacoEditor
          value={editorContent}
          language="javascript"
          onChange={handleEditorChange}
          theme="vs-dark"
        />
      </main>

      {/* Status Bar */}
      <footer className="h-6 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400">
        <span>JavaScript</span>
        <span className="ml-auto">
          Connected as {user?.name || user?.email}
        </span>
      </footer>
    </div>
  );
}

export default Editor;
