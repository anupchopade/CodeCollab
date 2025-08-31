import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import MonacoEditor from '../components/Editor/MonacoEditor';
import FileTree from '../components/FileExplorer/FileTree';
import EditorTabs from '../components/Editor/EditorTabs';
import EditorToolbar from '../components/Editor/EditorToolbar';
import Loading from '../components/UI/Loading';

function Editor() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { 
    currentProject, 
    loadProject, 
    activeFile, 
    setActiveFile, 
    openFiles,
    updateFileContent,
    saveFile 
  } = useProject();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editorContent, setEditorContent] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const navigate = useNavigate();

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        await loadProject(projectId);
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

  // Auto-save functionality
  useEffect(() => {
    if (!activeFile || !unsavedChanges) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        await saveFile(activeFile.id, editorContent);
        setUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [editorContent, activeFile, unsavedChanges, saveFile]);

  const handleEditorChange = useCallback((value) => {
    setEditorContent(value);
    setUnsavedChanges(true);
    updateFileContent(activeFile.id, value);
  }, [activeFile, updateFileContent]);

  const handleFileSelect = useCallback((file) => {
    setActiveFile(file);
    setEditorContent(file.content || '');
    setUnsavedChanges(false);
  }, [setActiveFile]);

  const handleSave = async () => {
    if (!activeFile || !unsavedChanges) return;
    
    try {
      await saveFile(activeFile.id, editorContent);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  if (isLoading) {
    return <Loading message="Loading project..." />;
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            ☰
          </button>
          <span className="text-white font-medium">
            {currentProject.name}
          </span>
          {unsavedChanges && (
            <span className="text-orange-400 text-sm">• Unsaved changes</span>
          )}
        </div>
        
        <div className="ml-auto flex items-center space-x-2">
          <EditorToolbar 
            onSave={handleSave}
            hasUnsavedChanges={unsavedChanges}
          />
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white text-sm"
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        {isSidebarOpen && (
          <aside className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="h-full overflow-auto">
              <FileTree 
                project={currentProject}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
              />
            </div>
          </aside>
        )}

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <EditorTabs 
            openFiles={openFiles}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
            onFileClose={(fileId) => {
              // Handle file closing logic
            }}
          />

          {/* Monaco Editor */}
          <div className="flex-1">
            {activeFile ? (
              <MonacoEditor
                value={editorContent}
                language={activeFile.language || 'javascript'}
                onChange={handleEditorChange}
                options={{
                  fontSize: 14,
                  lineNumbers: 'on',
                  minimap: { enabled: true },
                  wordWrap: 'on',
                  theme: 'vs-dark'
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-xl">Select a file to start editing</p>
                  <p className="text-sm mt-2">Choose a file from the sidebar to begin coding</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <footer className="h-6 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400">
            <span>
              {activeFile ? `${activeFile.name} • ${activeFile.language}` : 'No file selected'}
            </span>
            <span className="ml-auto">
              Connected as {user?.username || user?.email}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
export default Editor;
