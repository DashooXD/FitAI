const Header = window.Header;
const AIAssistant = window.AIAssistant;

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

function Settings() {
    const [user, setUser] = React.useState(window.getCurrentUser());
    const [theme, setAppTheme] = React.useState(window.getTheme());
    const [formData, setFormData] = React.useState({
        bio: user?.bio || '',
        avatarUrl: user?.avatarUrl || ''
    });
    const [status, setStatus] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    
    // Redeem Code State
    const [redeemCode, setRedeemCode] = React.useState('');
    const [redeemStatus, setRedeemStatus] = React.useState('');
    const [isRedeeming, setIsRedeeming] = React.useState(false);

    // Admin Access State
    const [isAdminAccessOpen, setIsAdminAccessOpen] = React.useState(false);
    const [adminPassword, setAdminPassword] = React.useState('');

    React.useEffect(() => {
        if (!user) {
            window.location.href = 'login.html';
        }
    }, [user]);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        window.setTheme(newTheme);
        setAppTheme(newTheme);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('');
        try {
            const updatedUser = await window.dbUpdateUserProfile(user.id, {
                bio: formData.bio,
                avatarUrl: formData.avatarUrl
            });
            window.updateUserSession(updatedUser.objectData);
            setUser(window.getCurrentUser());
            setStatus('success');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!redeemCode.trim()) return;
        
        setIsRedeeming(true);
        setRedeemStatus('');
        
        try {
            const codeResult = await window.dbUseRedeemCode(redeemCode.trim());
            
            if (codeResult) {
                // Code is valid and marked used, upgrade user
                await window.dbUpdateUserPremium(user.id, true);
                window.updateUserSession({ isPremium: true });
                setUser(window.getCurrentUser());
                setRedeemStatus('success');
                setRedeemCode('');
                alert("Upgrade Successful! Welcome to Premium.");
            } else {
                setRedeemStatus('invalid');
            }
        } catch (error) {
            console.error(error);
            setRedeemStatus('error');
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleDeactivatePremium = async () => {
        if (!confirm("Are you sure you want to disable your Premium status? You will need a new code to reactivate it.")) return;
        
        try {
            await window.dbUpdateUserPremium(user.id, false);
            window.updateUserSession({ isPremium: false });
            setUser(