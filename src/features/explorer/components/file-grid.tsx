"use client"

import * as React from "react"
import { FolderCard } from "./folder-card"
import { FileCard } from "./file-card"
import { ExplorerItem } from "../types"
import { useDriveUiStore } from "@/stores/drive-ui-store-provider"

interface FileGridProps {
	items: ExplorerItem[]
	onContextMenu?: (e: React.MouseEvent, item: ExplorerItem) => void
	onFileDoubleClick?: (file: any) => void
}

// Display folders and files grouped in grids
export function FileGrid({
	items,
	onContextMenu,
	onFileDoubleClick,
}: FileGridProps) {
	const selectedIds = useDriveUiStore((state) => state.selectedIds)

	const folders = items.filter((item) => item.kind === "folder")
	const files = items.filter((item) => item.kind === "file")

	return (
		<div className="flex flex-col gap-8">
			{folders.length > 0 && (
				<div className="drive-section">
					<h2 className="drive-section-heading">Folders</h2>
					<div className="drive-grid drive-folder-grid">
						{folders.map((item) => (
							<FolderCard
								key={item.id}
								folder={item.raw as any}
								selected={selectedIds.has(item.id)}
								onContextMenu={(e) => onContextMenu?.(e, item)}
							/>
						))}
					</div>
				</div>
			)}

			{files.length > 0 && (
				<div className="drive-section">
					<h2 className="drive-section-heading">Files</h2>
					<div className="drive-grid drive-file-grid">
						{files.map((item) => (
							<FileCard
								key={item.id}
								file={item.raw as any}
								selected={selectedIds.has(item.id)}
								onContextMenu={(e) => onContextMenu?.(e, item)}
								onDoubleClick={onFileDoubleClick}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
