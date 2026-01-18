export default function Loading() {
    return (
        <div className="flex space-x-2">
            <div className="w-3 h-12 bg-gray-300 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-12 bg-gray-600 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-12 bg-gray-400 animate-bounce"></div>
            <p className="text-gray-500 font-medium">Loading...</p>
        </div>
    )
}