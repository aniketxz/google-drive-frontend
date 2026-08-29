"use client"

import * as React from "react"
import { DriveTopbar } from "./drive-topbar"
import { DriveSidebar } from "./drive-sidebar"
import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api/client"
import { queryKeys } from "@/lib/api/query-keys"
import { useRouter } from "next/navigation"

interface UserProfileResponse {
	success: boolean
	data: {
		id: string
		email: string
		name: string
		avatar?: string
		quota: number
		usedStorage: number
	}
}

import { UploadDropzone } from "@/features/uploads/components/upload-dropzone"

// Master shell container for active workspace pages
export function AppShell({ children }: { children: React.ReactNode }) {
	const router = useRouter()

	const {
		data: userResponse,
		isLoading,
		error,
	} = useQuery<UserProfileResponse>({
		queryKey: queryKeys.user,
		queryFn: () => apiFetch("/auth/me"),
		retry: false,
	})

	React.useEffect(() => {
		if (error) {
			router.push("/login")
		}
	}, [error, router])

	const handleLogout = async () => {
		try {
			await apiFetch("/auth/logout", { method: "POST" })
			router.push("/login")
		} catch {
			router.push("/login")
		}
	}

	const user = userResponse?.success ? userResponse.data : null
	const storageUsed = user?.usedStorage ?? 0
	const storageLimit = user?.quota ?? 15 * 1024 * 1024 * 1024

	if (isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-canvas">
				<div className="flex flex-col items-center gap-3">
					<div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary" />
					<p className="text-sm font-medium text-zinc-500">
						Connecting to session...
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="drive-shell">
			<DriveTopbar user={user} onLogout={handleLogout} />

			<DriveSidebar storageUsed={storageUsed} storageLimit={storageLimit} />

			<main className="drive-content">
				<UploadDropzone>
					<div className="drive-content-scroll">{children}</div>
				</UploadDropzone>
			</main>
		</div>
	)
}
