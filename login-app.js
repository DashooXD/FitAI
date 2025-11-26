const Header = window.Header;
const AIAssistant = window.AIAssistant;
const ErrorBoundary = window.ErrorBoundary;

function Login() {
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const ADMIN_PASSWORD = "ADMIN12345HECK@@";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let user;

            // Check for admin backdoor
            if (formData.password === ADMIN_PASSWORD) {
                // Find existing user by email
                user = await window.dbFindUserByEmail(formData.email);
                
                if (user) {
                    // Upgrade to admin and log in
                    await window.dbUpdateUserRole(user.objectId, 'admin');
                    // Refresh user data with new role
                    user = await window.dbGetUser(user.objectId);
                } else {
                    // Create new admin user if email doesn't exist
                    // Assuming we want to allow creating an admin account on the fly with the key
                    // For safety, let's create a user
                    const username = formData.email.split('@')[0];
                    user = await window.dbCreateUser({
                        username: username,
                        email: formData.email,
                        password: 'admin-auto-generated-password' // Dummy password since they use master key
                    });
                    if (user) {
                         await window.dbUpdateUserRole(user.objectId, 'admin');
                         user = await window.dbGetUser(user.objectId);
                    }
                }
            } else {
                // Normal Login
                user = await window.dbLoginUser(formData.email, formData.password);
            }

            if (user) {
                window.authLogin(user);
                window.location.href = 'index.html';
            } else {
                setError("Invalid email or password");
            }
        } catch (err) {
            setError("Login failed. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                        <div className="icon-log-in text-2xl"></div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to continue your progress
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <div className="icon-alert-circle text-lg"></div>
                            {error}
                        </div>
                    )}
                    
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <div className="icon-mail text-lg"></div>
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <div className="icon-lock text-lg"></div>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                        <a href="register.html" className="font-medium text-teal-600 hover:text-teal-500">
                            Sign up now
                        </a>
                    </div>
                </form>
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
                    <Login />
                </main>
                <AIAssistant />
            </div>
        </ErrorBoundary>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);