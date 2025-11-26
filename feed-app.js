const Header = window.Header;
const AIAssistant = window.AIAssistant;
const ErrorBoundary = window.ErrorBoundary;

function Feed() {
    const [user] = React.useState(window.getCurrentUser());
    const [posts, setPosts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [newPost, setNewPost] = React.useState({ title: '', content: '' });
    const [isPosting, setIsPosting] = React.useState(false);

    React.useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const fetchedPosts = await window.dbListPosts();
            // Sort by date desc
            fetchedPosts.sort((a, b) => new Date(b.objectData.createdAt) - new Date(a.objectData.createdAt));
            setPosts(fetchedPosts);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please login to post");
        if (!newPost.title.trim() || !newPost.content.trim()) return;

        setIsPosting(true);
        try {
            await window.dbCreatePost({
                userId: user.id,
                username: user.username,
                title: newPost.title,
                content: newPost.content,
                userAvatar: user.avatarUrl
            });
            setNewPost({ title: '', content: '' });
            await loadPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to create post");
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (post) => {
        if (!user) return alert("Please login to like posts");
        
        const currentLikes = post.objectData.likedBy || [];
        const userId = user.id;
        let newLikes;

        if (currentLikes.includes(userId)) {
            newLikes = currentLikes.filter(id => id !== userId);
        } else {
            newLikes = [...currentLikes, userId];
        }

        try {
            // Optimistic update
            const updatedPosts = posts.map(p => {
                if (p.objectId === post.objectId) {
                    return { ...p, objectData: { ...p.objectData, likedBy: newLikes } };
                }
                return p;
            });
            setPosts(updatedPosts);

            await window.dbUpdatePostLikes(post.objectId, newLikes);
        } catch (error) {
            console.error(error);
            loadPosts(); // Revert on error
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Advice</h1>
                <button 
                    onClick={loadPosts} 
                    className="p-2 text-gray-500 hover:text-teal-600 transition-colors"
                    title="Refresh Feed"
                >
                    <div className="icon-refresh-cw text-xl"></div>
                </button>
            </div>

            {/* Create Post */}
            {user ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Share your advice</h2>
                    <form onSubmit={handlePostSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Title (e.g., My morning routine tips)"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                            required
                        />
                        <textarea
                            placeholder="Share your health journey or advice..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            rows="3"
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                            required
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPosting}
                                className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isPosting ? 'Posting...' : (
                                    <React.Fragment>
                                        <span>Post</span>
                                        <div className="icon-send text-sm"></div>
                                    </React.Fragment>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-6 text-center mb-8 border border-teal-100 dark:border-teal-800">
                    <p className="text-teal-800 dark:text-teal-200 mb-2">Join the community to share your advice!</p>
                    <a href="login.html" className="inline-block px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium">
                        Log in to Post
                    </a>
                </div>
            )}

            {/* Feed */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl p-6 h-48"></div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="icon-message-square-off text-4xl mx-auto mb-3 opacity-50"></div>
                    <p>No posts yet. Be the first to share!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => {
                        const data = post.objectData;
                        const isLiked = user && data.likedBy?.includes(user.id);
                        
                        return (
                            <div key={post.objectId} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {data.userAvatar ? (
                                            <img src={data.userAvatar} alt={data.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-gray-500">{data.username?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{data.username}</h3>
                                        <p className="text-xs text-gray-500">
                                            {new Date(data.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{data.title}</h4>
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-4 leading-relaxed">
                                    {data.content}
                                </p>

                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button 
                                        onClick={() => handleLike(post)}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                        }`}
                                    >
                                        <div className={`icon-heart text-lg ${isLiked ? 'fill-current' : ''}`}></div>
                                        <span>{data.likedBy?.length || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 transition-colors">
                                        <div className="icon-message-circle text-lg"></div>
                                        <span>Comment</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col font-sans">
                <Header />
                <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                    <Feed />
                </main>
                <AIAssistant />
            </div>
        </ErrorBoundary>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);