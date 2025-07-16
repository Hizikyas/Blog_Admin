import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Report {
  id: string;
  reason: string;
  type: string;
  reporter: string;
  createdat: string;
  postid: number;
  resolved: boolean;
}

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[] | null;
  onReportRemove: (reportId: string) => Promise<void>; // Add this prop
}

export default function ReportDetailsModal({ 
  isOpen, 
  onClose, 
  reports,
  onReportRemove 
}: ReportDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (!reports || reports.length === 0) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const handleRemoveReport = async (reportId: string) => {
    setIsDeleting(reportId);
    try {
      await onReportRemove(reportId);
    } catch (error) {
      console.error("Failed to remove report:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Report Details ({reports.length} {reports.length === 1 ? "Report" : "Reports"})
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
          {reports.map((report, index) => (
            <div
              key={report.id}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-md relative"
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-1 h-6 w-6"
                onClick={() => handleRemoveReport(report.id)}
                disabled={isDeleting === report.id}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
              
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Report {index + 1}
              </p>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reason</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reporter</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.reporter}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reported On</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(report.createdat)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Post ID</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.postid}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="bg-white/50 dark:bg-gray-800/50">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}