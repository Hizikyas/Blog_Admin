import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
}

export default function ReportDetailsModal({ isOpen, onClose, reports }: ReportDetailsModalProps) {
  if (!reports || reports.length === 0) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
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
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-md"
            >
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