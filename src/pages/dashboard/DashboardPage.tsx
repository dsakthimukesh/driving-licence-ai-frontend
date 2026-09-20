import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { DocumentItem } from '../../types/document';
import { getDocumentsApi } from '../../services/document-service';
import { DocumentUpload } from '../../components/documents/DocumentUpload';
import { StatusBadge } from '../../components/documents/StatusBadge';
import { Button } from '../../components/ui/Button';
import {
  FileUp,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Plus,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [showUpload, setShowUpload] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecentDocs = async () => {
      try {
        const response = await getDocumentsApi(1, 4);
        setRecentDocs(response.items || []);
      } catch {
        // Silently handle dash background fetch
      } finally {
        setIsLoadingDocs(false);
      }
    };
    fetchRecentDocs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-blue-200 border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>AI Document Intelligence Platform</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser?.name || currentUser?.email || 'User'}!
          </h1>
          <p className="text-blue-100/90 text-sm leading-relaxed">
            Upload driving licences and process documents with advanced OCR, structured key information extraction, and intelligent RAG question-answering.
          </p>
        </div>
      </div>

      {/* Inline Upload Component */}
      {showUpload && (
        <DocumentUpload
          onUploadSuccess={(docId) => {
            setShowUpload(false);
            navigate(`/documents/${docId}`);
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Main Grid: Upload Quick Action & Recent Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Upload Action Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upload Driving Licence</h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload front or back driving licence files (PDF, PNG, JPG) to trigger pre-signed upload URL generation and AI extraction.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setShowUpload(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Document Upload
            </Button>
          </div>
        </div>

        {/* Recent Documents Library Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Recent Documents</h3>
                  <p className="text-xs text-slate-500">Your latest uploaded documents</p>
                </div>
              </div>
              <Link to="/documents" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            {isLoadingDocs ? (
              <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                Loading recent items...
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                No documents uploaded yet. Click "Start Document Upload" above to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.document_id}
                    onClick={() => navigate(`/documents/${doc.document_id}`)}
                    className="p-3 bg-slate-50/70 hover:bg-slate-100/80 rounded-lg border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">{doc.file_name}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(doc.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link to="/documents">
              <Button variant="outline" size="md" className="w-full flex justify-between items-center text-slate-700">
                <span>Open Full Documents Library</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Session Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">Active Authentication Session</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block font-medium">User Name</span>
            <span className="text-slate-800 font-semibold mt-0.5 block">{currentUser?.name || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block font-medium">Registered Email</span>
            <span className="text-slate-800 font-semibold mt-0.5 block">{currentUser?.email || 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-slate-400 block font-medium">User ID (UUID)</span>
            <span className="text-slate-800 font-mono text-[11px] truncate mt-0.5 block">{currentUser?.user_id || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
