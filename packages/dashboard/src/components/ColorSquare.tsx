const tailwindColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
]

function hashStringToColor(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return tailwindColors[Math.abs(hash) % tailwindColors.length]
}

export function ColorSquare({ name, big }: { name: string, big?: boolean }) {
    const colorClass = hashStringToColor(name)
    return <div className={big ? `w-7 h-7 rounded ${colorClass}`: `w-5 h-5 rounded ${colorClass}`} />
}
