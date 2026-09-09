const SidebarSkeleton = () => {
    return (
        <aside className="flex h-full w-full flex-col border-r border-base-300/60 bg-base-100/60 transition-all duration-200">
            {/* Header skeleton */}
            <div className="w-full shrink-0 p-4 space-y-3 border-b border-base-300/40">
                <div className="flex items-center justify-between">
                    <div className="skeleton h-4 w-28 rounded-md"></div>
                    <div className="skeleton h-4 w-6 rounded-full"></div>
                </div>
                <div className="skeleton h-8 w-full rounded-full"></div>
            </div>

            {/* List skeleton items */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-full p-2.5 flex items-center gap-3 rounded-2xl bg-base-200/40">
                        <div className="skeleton size-11 rounded-2xl shrink-0"></div>
                        <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-3.5 w-28 rounded-md"></div>
                            <div className="skeleton h-2.5 w-16 rounded-md opacity-60"></div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default SidebarSkeleton;
