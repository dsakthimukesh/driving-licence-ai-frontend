import React, { useState, useEffect } from 'react';
import type { DocumentInfo, DocumentInfoUpdateRequest } from '../../types/document';
import { updateDocumentInfoApi } from '../../services/document-service';
import { InformationField } from './InformationField';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ErrorAlert } from '../common/ErrorAlert';
import {
  CreditCard,
  User,
  UserCheck,
  Calendar,
  Heart,
  MapPin,
  Truck,
  Building2,
  AlertTriangle,
  Info,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface ExtractedInformationCardProps {
  documentId: string;
  info: DocumentInfo | null;
  onUpdateSuccess?: (updatedInfo: DocumentInfo) => void;
}

export const ExtractedInformationCard: React.FC<ExtractedInformationCardProps> = ({
  documentId,
  info,
  onUpdateSuccess,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Editable Form State
  const [formData, setFormData] = useState<DocumentInfoUpdateRequest>({});

  // Sync form state whenever info prop changes or when edit mode starts
  useEffect(() => {
    if (info) {
      setFormData({
        licence_number: info.licence_number || '',
        full_name: info.full_name || '',
        parent_name: info.parent_name || '',
        date_of_birth: info.date_of_birth || '',
        blood_group: info.blood_group || '',
        address: info.address || '',
        issue_date: info.issue_date || '',
        expiry_date: info.expiry_date || '',
        vehicle_authorization: info.vehicle_authorization || '',
        issuing_authority: info.issuing_authority || '',
        restrictions: info.restrictions || '',
        other_information: info.other_information || '',
      });
    }
  }, [info, isEditing]);

  const handleInputChange = (field: keyof DocumentInfoUpdateRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const targetDocId = documentId || info?.document_id;
    if (!targetDocId) {
      setError('Document ID is missing. Cannot save changes.');
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateDocumentInfoApi(targetDocId, formData);
      setSuccessMessage('Document information saved successfully!');
      setIsEditing(false);
      if (onUpdateSuccess) {
        onUpdateSuccess(updated);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Utility to format ISO date strings cleanly.
   */
  const formatDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Extracted Driving Licence Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured information extracted via OCR & AI pipeline • Fully Editable
          </p>
        </div>

        {/* Action Controls & Last Modified Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {info?.last_modified_by && (
            <div
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80"
              title={`Last modified by ${info.last_modified_by}`}
            >
              <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>
                Edited by: <span className="font-semibold">{info.last_modified_by}</span>
              </span>
            </div>
          )}

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Details</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Save Failed"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
        </div>
      )}

      {/* Edit Form Mode vs Display Read Mode */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Licence Number"
              value={formData.licence_number || ''}
              onChange={(e) => handleInputChange('licence_number', e.target.value)}
              placeholder="e.g. MH12 20190001234"
            />
            <Input
              label="Full Name"
              value={formData.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Full name as printed on licence"
            />
            <Input
              label="Parent / Guardian Name"
              value={formData.parent_name || ''}
              onChange={(e) => handleInputChange('parent_name', e.target.value)}
              placeholder="Father / Spouse / Parent name"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            />
            <Input
              label="Blood Group"
              value={formData.blood_group || ''}
              onChange={(e) => handleInputChange('blood_group', e.target.value)}
              placeholder="e.g. O+, A+, B+"
            />
            <Input
              label="Vehicle Authorization"
              value={formData.vehicle_authorization || ''}
              onChange={(e) => handleInputChange('vehicle_authorization', e.target.value)}
              placeholder="e.g. LMV, MCWG"
            />
            <Input
              label="Issue Date"
              type="date"
              value={formData.issue_date || ''}
              onChange={(e) => handleInputChange('issue_date', e.target.value)}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiry_date || ''}
              onChange={(e) => handleInputChange('expiry_date', e.target.value)}
            />
            <Input
              label="Issuing Authority"
              value={formData.issuing_authority || ''}
              onChange={(e) => handleInputChange('issuing_authority', e.target.value)}
              placeholder="e.g. RTO, Pune"
            />
            <Input
              label="Restrictions"
              value={formData.restrictions || ''}
              onChange={(e) => handleInputChange('restrictions', e.target.value)}
              placeholder="e.g. Wear spectacles"
            />
            <Input
              label="Other Information"
              value={formData.other_information || ''}
              onChange={(e) => handleInputChange('other_information', e.target.value)}
              placeholder="Remarks or additional details"
            />
          </div>

          <div className="w-full space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea
              rows={3}
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full address"
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        /* Display Card View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InformationField
              label="Licence Number"
              value={info?.licence_number}
              icon={CreditCard}
            />
            <InformationField
              label="Full Name"
              value={info?.full_name}
              icon={User}
            />
            <InformationField
              label="Parent / Guardian Name"
              value={info?.parent_name}
              icon={UserCheck}
            />
            <InformationField
              label="Date of Birth"
              value={formatDate(info?.date_of_birth)}
              icon={Calendar}
            />
            <InformationField
              label="Blood Group"
              value={info?.blood_group}
              icon={Heart}
            />
            <InformationField
              label="Vehicle Authorization"
              value={info?.vehicle_authorization}
              icon={Truck}
            />
            <InformationField
              label="Issue Date"
              value={formatDate(info?.issue_date)}
              icon={Calendar}
            />
            <InformationField
              label="Expiry Date"
              value={formatDate(info?.expiry_date)}
              icon={Calendar}
            />
            <InformationField
              label="Issuing Authority"
              value={info?.issuing_authority}
              icon={Building2}
            />
            <InformationField
              label="Restrictions"
              value={info?.restrictions}
              icon={AlertTriangle}
            />
            <InformationField
              label="Other Information"
              value={info?.other_information}
              icon={Info}
            />
          </div>

          <div className="pt-2">
            <InformationField
              label="Address"
              value={info?.address}
              icon={MapPin}
              multiline
            />
          </div>
        </div>
      )}
    </div>
  );
};
