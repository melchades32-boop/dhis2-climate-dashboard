import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/climate-malaria-relationship/')({
    component: ClimateMalariaRelationship,
})

function ClimateMalariaRelationship() {
    return (
        <div className="mx-auto max-w-4xl">
            <p className="text-gray-500">Climate &amp; Malaria Relationship - coming soon.</p>
        </div>
    )
}
