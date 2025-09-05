"use client";

import { cn } from "@/lib/utils";

interface Tab {
	id: string;
	label: string;
	description?: string;
}

interface TabNavigationProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	className?: string;
}

export default function TabNavigation({
	tabs,
	activeTab,
	onTabChange,
	className,
}: TabNavigationProps) {
	return (
		<div
			className={cn(
				"w-full border-b border-border bg-background",
				className,
			)}
		>
			<div className="container mx-auto px-4">
				<nav className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={cn(
								"relative min-w-0 flex-shrink-0 py-4 px-3 md:px-1 text-sm font-medium transition-colors",
								"border-b-2 border-transparent",
								"hover:text-foreground touch-manipulation",
								"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
								activeTab === tab.id
									? "text-primary border-primary"
									: "text-muted-foreground",
							)}
						>
							<div className="flex flex-col items-center gap-1">
								<span className="whitespace-nowrap text-sm md:text-base">{tab.label}</span>
								{tab.description && (
									<span className="text-xs text-muted-foreground hidden sm:block">
										{tab.description}
									</span>
								)}
							</div>
						</button>
					))}
				</nav>
			</div>
		</div>
	);
}
