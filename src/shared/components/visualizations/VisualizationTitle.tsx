export function VisualizationTitle({ title }: { title: string }) {
    return (
        <span className="font-bold flex-1 min-h-10 leading-tight line-clamp-2 flex items-start">
            {title}
        </span>
    )
}
