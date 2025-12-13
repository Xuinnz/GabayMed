import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const searchableFeatures = [
  // System Setup & Configuration
  { title: "Overview", category: "System Setup & Configuration", route: "/settings/overview" },
  { title: "Location Information", category: "System Setup & Configuration", route: "/settings/locations" },
  { title: "User Accounts", category: "System Setup & Configuration", route: "/settings/users" },

  // Financial & Billing
  { title: "Carrier", category: "Financial & Billing", route: "/billing/carriers" },
  { title: "Procedure Codes", category: "Financial & Billing", route: "/billing/procedure-codes" },
  { title: "Fee Schedules", category: "Financial & Billing", route: "/billing/fee-schedules" },

  // Claims Management
  { title: "Unsent Claims", category: "Claims Management (Reports)", route: "/reports/unsent-claims" },
  { title: "Sent Claims", category: "Claims Management (Reports)", route: "/reports/sent-claims" },
]

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [filteredResults, setFilteredResults] = useState([])
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (query.trim()) {
      const results = searchableFeatures.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      setFilteredResults(results)
      setIsOpen(true)
    } else {
      setFilteredResults([])
      setIsOpen(false)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        if (!query) {
          setIsExpanded(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [query])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  // Group results by category
  const groupedResults = filteredResults.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {},
  )

  return (
    <div ref={containerRef} className="relative flex items-center">
      <div
        className={cn(
          "relative flex items-center transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-10",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[#F4F4F4] rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-200",
            isExpanded ? "opacity-0 pointer-events-none" : "opacity-100",
          )}
          onClick={() => setIsExpanded(true)}
        >
          <Search className="w-5 h-5 text-gray-500" />
        </div>

        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsExpanded(true)
            if (query) setIsOpen(true)
          }}
          className={cn(
            "h-10 pl-10 pr-8 rounded-full border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-400 transition-all duration-300",
            isExpanded ? "opacity-100 w-full" : "opacity-0 w-0 p-0 border-none",
          )}
          placeholder="Search..."
        />
        {isExpanded && (
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        {isExpanded && query && (
          <button
            onClick={() => {
              setQuery("")
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && filteredResults.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {Object.entries(groupedResults).map(([category, results]) => (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {category}
              </div>
              <div>
                {results.map((result, index) => (
                  <a
                    key={index}
                    href={result.route}
                    className="flex items-center px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer group"
                    onClick={() => {
                      setIsOpen(false)
                      setQuery("")
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{result.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{result.route}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query && filteredResults.length === 0 && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-sm text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  )
}
