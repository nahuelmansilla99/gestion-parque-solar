export function Navigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'parques', label: 'Parques', icon: '⚡' },
    ];

    return (
        <nav className="flex gap-2 mb-6 border-b border-border pb-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
            px-6 py-3 rounded-t-lg font-medium transition-all duration-200
            flex items-center gap-2
            ${activeTab === tab.id
                            ? 'bg-surface text-heading border-b-2 border-brand-secondary shadow-lg'
                            : 'text-muted hover:text-heading hover:bg-surface-light/30'
                        }
          `}
                >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
