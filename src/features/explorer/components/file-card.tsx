"use client"

import * as React from "react"
import { DriveCard } from "@/components/drive/drive-card"
import { FileKindIcon } from "@/components/drive/file-kind-icon"
import { DriveFile } from "@/features/files/schemas"
import { getFileKind } from "@/lib/files/file-kind"
import { MoreVertical, Star } from "lucide-react"
import { useDriveUiStore } from "@/stores/drive-ui-store-provider"

interface FileCardProps {
	file: DriveFile
	selected?: boolean
	onContextMenu?: (e: React.MouseEvent, file: DriveFile) => void
	onDoubleClick?: (file: DriveFile) => void
}

// Display individual file item in Grid mode
export function FileCard({
	file,
	selected = false,
	onContextMenu,
	onDoubleClick,
}: FileCardProps) {
	const selectOnly = useDriveUiStore((state) => state.selectOnly)
	const toggleSelected = useDriveUiStore((state) => state.toggleSelected)
	const fileKind = getFileKind(file.mimeType)

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (e.metaKey || e.ctrlKey) {
			toggleSelected(file.id)
		} else {
			selectOnly(file.id)
		}
	}

	const handleDoubleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (onDoubleClick) {
			onDoubleClick(file)
		}
	}

	const handleMoreClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (onContextMenu) {
			onContextMenu(e, file)
		}
	}

	return (
		<DriveCard
			kind="file"
			selected={selected}
			onClick={handleClick}
			onDoubleClick={handleDoubleClick}
			onContextMenu={(e) => {
				e.preventDefault()
				if (onContextMenu) onContextMenu(e, file)
			}}
		>
			<div className="drive-card-header">
				<FileKindIcon kind={fileKind} className="h-5 w-5 flex-shrink-0" />
				<span
					className="drive-card-name text-sm font-medium truncate flex-1"
					title={file.originalName}
				>
					{file.originalName}
				</span>
				{file.isStarred && (
					<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0 mr-1" />
				)}
				<button
					onClick={handleMoreClick}
					className="drive-card-more"
					aria-label={`More actions for ${file.originalName}`}
				>
					<MoreVertical className="h-4 w-4" />
				</button>
			</div>

			<div className="drive-card-preview">
				<FileKindIcon kind={fileKind} className="h-12 w-12 opacity-45" />
			</div>
		</DriveCard>
	)
}
