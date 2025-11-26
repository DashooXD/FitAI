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

function Hero() {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-700 dark:text-teal-300 mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
                        <span className="text-sm font-medium">The Future of Personal Health</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-balance bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Your Personal AI Health Companion
                    </h1>
                    
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
                        FitAI helps you track your health journey, connect with a supportive community, and get instant advice from our advanced AI assistant.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="register.html" className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-1">
                            Get Started Free
                        </a>
                    </div>
                </div>
            </div>
            
            {/* Abstract Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-400/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[80px] -z-10"></div>
        </section>
    );
}

function Features() {
    const features = [
        {
            icon: 'users',
            title: 'Community Advice',
            desc: 'Join a vibrant community. Share your journey, ask questions, and get advice from others.'
        },