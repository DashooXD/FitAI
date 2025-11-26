const Header = window.Header;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md mx-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">We're sorry, but something unexpected happened.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors">Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboard() {
    const [user] = React.useState(window.getCurrentUser());
    const [codes, setCodes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (!user || user.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        loadCodes();
    }, [user]);

    const loadCodes = async () => {
        try {
            const list = await window.dbListRedeemCodes();
            // Sort by createdAt desc
            list.sort((a, b) => new Date(b.objectData.createdAt) - new Date(a.objectData.createdAt));
            setCodes(list);
        } catch (e) {
            console.error(e);
        }
    };

    const generateCode = async () => {
        setIsLoading(true);
        try {
            // Generate random string like 'PREMIUM-XXXX-XXXX'
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
            const code = `PREMIUM-${randomPart}`;
            
            await window.dbCreateRedeemCode(code);
            await loadCodes();
        } catch (e) {
            console.error(e);
            alert("Failed to generate code");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="icon-shield-check text-red-600"></div>
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500">Manage premium redeem codes</p>
                </div>
                <button
                    onClick={generateCode}
                    disabled={isLoading}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center gap-2 font-medium"
                >
                    <div className="icon-plus text-lg"></div>
                    Generate New Code
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Code</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {codes.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No codes generated yet.</td>
                                </tr>
                            ) : (
                                codes.map(code => (
                                    <tr key={code.objectId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                                            {code.objectData.code}
                                        </td>
                                        <td className="px-6 py-4">
                                            {code.objectData.isUsed ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                    Used
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                    Available
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(code.objectData.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col font-sans">
                <Header />
                <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                    <AdminDashboard />
                </main>
            </div>
        </ErrorBoundary>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);