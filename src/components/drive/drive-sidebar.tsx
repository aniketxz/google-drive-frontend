"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
	Plus,
	Home,
	Briefcase,
	HardDrive,
	Monitor,
	Users,
	Clock,
	Star,
	AlertTriangle,
	Trash2,
	FolderPlus,
	Upload,
} from "lucide-react"
import { DriveNavItem } from "./drive-nav-item"
import { StorageMeter } from "./storage-meter"
import { DriveButton } from "./drive-button"
import { useDriveUiStore } from "@/stores/drive-ui-store-provider"
import { selectSidebarOpen } from "@/stores/selectors"

interface DriveSidebarProps {
	storageUsed: number
	storageLimit: number
}

// Side navigation drawer/bar container
export function DriveSidebar({ storageUsed, storageLimit }: DriveSidebarProps) {
	const pathname = usePathname()
	const sidebarOpen = useDriveUiStore(selectSidebarOpen)
	const setSidebarOpen = useDriveUiStore((state) => state.setSidebarOpen)
	const openDialog = useDriveUiStore((state) => state.openDialog)

	const [dropdownOpen, setDropdownOpen] = React.useState(false)
	const dropdownRef = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false)
			}
		}

		if (dropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [dropdownOpen])

	const handleCreateFolder = () => {
		setDropdownOpen(false)
		openDialog("createFolder")
		setSidebarOpen(false)
	}

	const handleUploadFile = () => {
		setDropdownOpen(false)
		setSidebarOpen(false)
		const fileInput = document.getElementById("drive-upload-file-input")
		if (fileInput) {
			;(fileInput as HTMLInputElement).click()
		}
	}

	return (
		<>
			<div
				className="drive-sidebar-scrim"
				data-open={sidebarOpen ? "true" : undefined}
				onClick={() => setSidebarOpen(false)}
			/>

			<aside
				className="drive-sidebar"
				data-open={sidebarOpen ? "true" : undefined}
			>
				<div ref={dropdownRef} className="relative mb-3">
					<DriveButton
						variant="new"
						onClick={() => setDropdownOpen(!dropdownOpen)}
						aria-haspopup="true"
						aria-expanded={dropdownOpen}
					>
						<Plus className="h-6 w-6" />
						<span className="drive-new-label text-sm font-medium">New</span>
					</DriveButton>

					{dropdownOpen && (
						<div className="absolute left-0 top-full mt-0.5 w-52 rounded-xl bg-card py-1.5 shadow-lg border border-border/60 z-50 animate-in fade-in zoom-in-95 duration-100">
							<button
								type="button"
								onClick={handleCreateFolder}
								className="flex w-full h-9 items-center gap-3.5 px-3.5 py-1.5 text-left text-sm text-foreground hover:bg-surface-low transition-colors font-normal select-none"
							>
								<FolderPlus className="h-4 w-4 text-foreground shrink-0" />
								<span>New folder</span>
							</button>
							<div className="h-px my-1 bg-border/60" />
							<button
								type="button"
								onClick={handleUploadFile}
								className="flex w-full h-9 items-center gap-3.5 px-3.5 py-1.5 text-left text-sm text-foreground hover:bg-surface-low transition-colors font-normal select-none"
							>
								<Upload className="h-4 w-4 text-foreground shrink-0" />
								<span>File upload</span>
							</button>
						</div>
					)}
				</div>

				<nav className="drive-nav-group">
					<DriveNavItem icon={Home} label="Home" disabled />
					<DriveNavItem icon={Briefcase} label="Projects" disabled />
				</nav>

				<nav className="drive-nav-group">
					<DriveNavItem
						icon={HardDrive}
						label="My Drive"
						href="/dashboard"
						active={
							pathname === "/dashboard" || pathname.startsWith("/drive/folders")
						}
						onClick={() => setSidebarOpen(false)}
					/>
					<DriveNavItem icon={Monitor} label="Computers" disabled />
				</nav>

				<nav className="drive-nav-group">
					<DriveNavItem icon={Users} label="Shared with me" disabled />
					<DriveNavItem icon={Clock} label="Recent" disabled />
					<DriveNavItem
						icon={Star}
						label="Starred"
						href="/starred"
						active={pathname === "/starred"}
						onClick={() => setSidebarOpen(false)}
					/>
					<DriveNavItem icon={AlertTriangle} label="Spam" disabled />
					<DriveNavItem
						icon={Trash2}
						label="Trash"
						href="/trash"
						active={pathname === "/trash"}
						onClick={() => setSidebarOpen(false)}
					/>
					<StorageMeter used={storageUsed} total={storageLimit} />
				</nav>
			</aside>
		</>
	)
}
