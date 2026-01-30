import { AppSidebar } from "../../components/layout/app-sidebar";
import { BreadcrumbHeader } from "../../components/layout/breadcrumb-header";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { SessionProvider } from "next-auth/react";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SessionProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<BreadcrumbHeader />
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</SessionProvider>
	);
}
