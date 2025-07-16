"use client";

import { useState, useEffect } from "react";
import { Search, Moon, Sun, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FilterDropdown from "@/components/FilterDropdown";
import ReportDetailsModal from "@/components/ReportDetailsModal";
import Image from 'next/image';

interface Blog {
  id: number;
  title: string;
  blog: string;
  catagory: string;
  date: string;
  image: string | null;
  nickname: string | null;
  reported?: boolean;
}

interface Report {
  id: string;
  reason: string;
  type: string;
  reporter: string;
  createdat: string;
  postid: number;
  resolved: boolean;
}

export default function AdminPanel() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "reported">("all");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Report[] | null>(null);

  const fetchBlogs = async (showReported: boolean = false) => {
    try {
      setIsLoading(true);

      // Fetch all blogs
      const blogsRes = await fetch("https://blog-platform-qqqt.vercel.app/api/posts-with-comments", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!blogsRes.ok) throw new Error(`Failed to fetch blogs: ${blogsRes.status}`);
      let blogsData: Blog[] = await blogsRes.json();

      // Fetch reported blogs
      const reportsRes = await fetch("https://blog-platform-qqqt.vercel.app/api/report", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!reportsRes.ok) throw new Error(`Failed to fetch reports: ${reportsRes.status}`);
      const reportsData: Report[] = await reportsRes.json();

      // Store reports for modal
      setReports(reportsData);

      // Create a set of reported blog IDs
      const reportedBlogIds = new Set(reportsData.filter(report => !report.resolved).map(report => report.postid));

      // Mark blogs as reported if their ID is in reportedBlogIds
      blogsData = blogsData.map(blog => ({
        ...blog,
        reported: reportedBlogIds.has(blog.id),
      }));

      // Filter for reported blogs if in reported view
      if (showReported) {
        blogsData = blogsData.filter(blog => blog.reported);
      }

      // Sort blogs by date (newest first)
      const sortedBlogs = [...blogsData].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setBlogs(sortedBlogs);
      setError(null);
    } catch (err) {
      setError("Failed to load blogs. Please try again later.");
      console.error("Error fetching blogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Handle theme
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);

    // Initial fetch of all blogs
    fetchBlogs();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 5) return "added recently";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleDeleteBlog = async (blogId: number) => {
    try {
      console.log("Deleting blog with ID:", blogId);
      const res = await fetch(`https://blog-platform-frrq.vercel.app/api/report?id=${blogId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to delete blog: ${res.status}`);
      fetchBlogs(viewMode === "reported");
    } catch (err) {
      setError("Failed to delete blog. Please try again later.");
      console.error("Error deleting blog:", err);
    }
  };

  const handleRemoveReports = async (blogId: number) => {
    try {
      console.log("Removing reports for blog with ID:", blogId);
      const res = await fetch(`https://blog-platform-n1a2.vercel.app/api/deletereport?postid=${blogId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Failed to remove reports: ${res.status}`);
      fetchBlogs(viewMode === "reported");
    } catch (err) {
      setError("Failed to remove reports. Please try again later.");
      console.error("Error removing reports:", err);
    }
  };

  const openReportModal = (blogId: number) => {
    const blogReports = reports.filter(r => r.postid === blogId && !r.resolved);
    if (blogReports.length > 0) {
      setSelectedReports(blogReports);
      setIsReportModalOpen(true);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.blog.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || blog.catagory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black transition-all duration-500">
      <header className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-light">
              Manage blogs and reported content
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 items-center max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                />
              </div>

              <Button variant="outline" size="icon" className="bg-white/50 dark:bg-gray-800/50">
                <Search className="w-4 h-4" />
              </Button>

              <Button
                variant={viewMode === "reported" ? "default" : "outline"}
                onClick={() => {
                  setViewMode("reported");
                  fetchBlogs(true);
                }}
                className="bg-white/50 dark:bg-gray-800/50"
              >
                Reported Blogs
              </Button>

              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                onClick={() => {
                  setViewMode("all");
                  fetchBlogs();
                }}
                className="bg-white/50 dark:bg-gray-800/50"
              >
                All Blogs
              </Button>

              <FilterDropdown
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="bg-white/50 dark:bg-gray-800/50"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <Card className="p-8 text-center bg-white/50 dark:bg-gray-800/50">
              <p className="text-gray-500 dark:text-gray-400 text-md">Loading blogs...</p>
            </Card>
          ) : error ? (
            <Card className="p-8 text-center bg-white/50 dark:bg-gray-800/50">
              <p className="text-red-500 text-md">{error}</p>
            </Card>
          ) : filteredBlogs.length === 0 ? (
            <Card className="p-8 text-center bg-white/50 dark:bg-gray-800/50">
              <p className="text-gray-500 dark:text-gray-400 text-md">
                No blogs found matching your criteria.
              </p>
            </Card>
          ) : (
            filteredBlogs.map((blog, index) => (
              <Card
                key={blog.id}
                className="overflow-hidden hover:shadow-md transition-all duration-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {blog.image && (
                      <div className="sm:w-1/4">
<Image 
  src={blog.image} 
  alt={blog.title} 
  width={300}
  height={200}
  className="w-full h-24 sm:h-32 object-cover"
/>
                      </div>
                    )}
                    <div className={`p-4 flex-1 ${!blog.image ? "w-full" : ""}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 text-xs"
                        >
                          {blog.catagory}
                        </Badge>
                        {blog.reported && viewMode === "reported" && (
                          <Badge
                            variant="destructive"
                            className="bg-red-500 text-white text-xs cursor-pointer"
                            onClick={() => openReportModal(blog.id)}
                          >
                            Reported
                          </Badge>
                        )}
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(blog.date)}
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-1">
                        {blog.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm line-clamp-2">
                        {blog.blog}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          By {blog.nickname || "user"}
                        </p>
                        <div className="flex gap-2">
                          {blog.reported && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveReports(blog.id)}
                              className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800"
                            >
                              Remove Reports
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="bg-red-600 hover:bg-red-700 text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <ReportDetailsModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reports={selectedReports}
      />
    </div>
  );
}