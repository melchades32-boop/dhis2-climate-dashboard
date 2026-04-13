import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/current-malaria-situation/')({
    component: CurrentMalariaSituation,
})

function CurrentMalariaSituation() {
    return (
       <div className="mx-auto max-w-4xl">
            <p className="text-gray-500">Current Malaria Situation - coming soon.</p>
        </div>
    )
}
