"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Search, Filter, SortAsc, X } from "lucide-react";
import FormCard from "@/components/dashboard/FormCard";
import { mockForms } from "@/lib/mock-data";
import { FormSchema } from "@/types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SortOption = "newest" | "oldest" | "mostViews" | "mostResponses" | "title";
type FilterStatus = "all" | "published" | "draft";

export default function DashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const handleCreateNew = () => {
    const newId = Date.now().toString();
    router.push(`/builder/${newId}`);
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const newId = Date.now().toString();
    router.push(`/builder/${newId}?template=${templateId}`);
  };

  const formTemplates = [
    { id: "contact", name: "Contact Form", description: "Basic contact information form" },
    { id: "survey", name: "Survey Form", description: "Multi-question survey template" },
    { id: "feedback", name: "Feedback Form", description: "Customer feedback collection" },
    { id: "registration", name: "Registration Form", description: "Event or user registration" },
  ];

  const filteredAndSortedForms = useMemo(() => {
    let filtered: FormSchema[] = [...mockForms];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (form) =>
          form.title.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((form) => form.status === statusFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest":
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "mostViews":
          return (b.viewCount || 0) - (a.viewCount || 0);
        case "mostResponses":
          return (b.responseCount || 0) - (a.responseCount || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [searchQuery, statusFilter, sortBy]);

  const totalForms = mockForms.length;
  const showingForms = filteredAndSortedForms.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and create your forms
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create New Form
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search forms by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-[160px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostViews">Most Views</option>
              <option value="mostResponses">Most Responses</option>
              <option value="title">Title (A-Z)</option>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{showingForms}</span> of{" "}
          <span className="font-semibold text-foreground">{totalForms}</span> forms
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="ml-2 h-auto p-0 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Forms Grid */}
      {filteredAndSortedForms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedForms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No forms found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first form to get started"}
          </p>
          {(!searchQuery && statusFilter === "all") && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Form
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

