import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';

const Layout = React.lazy(() => import('./components/Layout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Study = React.lazy(() => import('./pages/Study'));
const CreateCard = React.lazy(() => import('./pages/CreateCard'));
const CardManager = React.lazy(() => import('./pages/CardManager'));
const Statistics = React.lazy(() => import('./pages/Statistics'));
const Settings = React.lazy(() => import('./pages/Settings'));

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-red-100 p-8 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <h1 className="text-4xl font-bold">Bir şeyler ters gitti.</h1>
          <p className="mt-4 text-lg">Uygulama bir hatayla karşılaştı ve yeniden başlatılması gerekiyor.</p>
          <pre className="mt-6 w-full max-w-2xl overflow-auto rounded-lg bg-red-200 p-4 font-mono text-sm dark:bg-red-900/30">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 rounded-md bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingSpinner = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
    </div>
);


function App() {
  const { mode } = useThemeStore();

  React.useEffect(() => {
    // This is just to ensure the store is initialized, which it is in main.tsx
    console.log("App component mounted. Current theme mode:", mode);
  }, [mode]);

  return (
    <div className={`min-h-screen bg-background text-foreground ${mode === 'dark' ? 'dark' : ''}`}>
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/study" element={<Study />} />
                <Route path="/study/:deckId" element={<Study />} />
                <Route path="/create" element={<CreateCard />} />
                <Route path="/manager" element={<CardManager />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;
